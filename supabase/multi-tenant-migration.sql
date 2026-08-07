-- ============================================================
-- SIVP — multi-tenant migration
-- Run in: Supabase Dashboard -> SQL Editor, AFTER schema.sql and
-- sidebar-migration.sql. Additive; safe to re-run.
--
-- Turns SIVP from a single-organisation app into one that can be sold to
-- any university incubator:
--   1. Every row belongs to an institution; RLS isolates institutions.
--   2. Signup is closed: mentors/admins by invite, students by email domain.
--   3. SECURITY FIX — role can no longer be set by the client. The old
--      handle_new_user() copied `role` straight out of signup metadata, so
--      anyone with the (public) anon key could sign up as an admin.
--   4. SECURITY FIX — users can no longer edit their own role, institution,
--      or funding_raised (the last would let a founder game the leaderboard).
-- ============================================================

-- ---------- institutions ----------
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  domains text[] not null default '{}',   -- students with these email domains may self-register
  created_at timestamptz default now()
);

-- >>> EDIT THIS for your university, then add more rows per customer <<<
insert into public.institutions (name, slug, domains)
values ('K.R. Mangalam University', 'krmu', '{krmangalam.edu.in}')
on conflict (slug) do nothing;

-- ---------- invitations (mentors/admins, and any invited student) ----------
create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  email text not null,
  role text not null default 'student' check (role in ('student','mentor','admin')),
  invited_by uuid references public.profiles(id) on delete set null,
  by_name text,
  accepted_at timestamptz,
  expires_at timestamptz not null default now() + interval '14 days',
  created_at timestamptz default now()
);
create index if not exists invitations_email_idx on public.invitations (lower(email));

-- ---------- tenant column on every institution-scoped table ----------
alter table public.profiles           add column if not exists institution_id uuid references public.institutions(id) on delete cascade;
alter table public.cohorts            add column if not exists institution_id uuid references public.institutions(id) on delete cascade;
alter table public.applications       add column if not exists institution_id uuid references public.institutions(id) on delete cascade;
alter table public.events             add column if not exists institution_id uuid references public.institutions(id) on delete cascade;
alter table public.announcements      add column if not exists institution_id uuid references public.institutions(id) on delete cascade;
alter table public.community_messages add column if not exists institution_id uuid references public.institutions(id) on delete cascade;

-- Backfill everything that predates this migration onto the first institution.
do $$
declare first_inst uuid;
begin
  select id into first_inst from public.institutions order by created_at limit 1;
  update public.profiles           set institution_id = first_inst where institution_id is null;
  update public.cohorts            set institution_id = first_inst where institution_id is null;
  update public.applications       set institution_id = first_inst where institution_id is null;
  update public.events             set institution_id = first_inst where institution_id is null;
  update public.announcements      set institution_id = first_inst where institution_id is null;
  update public.community_messages set institution_id = first_inst where institution_id is null;
end $$;

-- ============================================================
-- Helpers
-- ============================================================

-- The caller's institution. SECURITY DEFINER so it can read profiles
-- without recursing through profiles' own RLS policy.
create or replace function public.my_institution()
returns uuid language sql stable security definer set search_path = public as $$
  select institution_id from public.profiles where id = auth.uid();
$$;

-- True when `target` (a profile id) is in the caller's institution.
-- NULL institutions never match, so an unassigned row is never leaked.
create or replace function public.shares_institution(target uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.profiles p, public.profiles me
    where p.id = target
      and me.id = auth.uid()
      and p.institution_id = me.institution_id
      and p.institution_id is not null
  );
$$;

-- Stamps the caller's institution on insert so the frontend can't forget it
-- (or spoof someone else's).
create or replace function public.set_institution()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.institution_id is null then
    new.institution_id := public.my_institution();
  end if;
  return new;
end; $$;

drop trigger if exists cohorts_set_institution   on public.cohorts;
drop trigger if exists events_set_institution    on public.events;
drop trigger if exists ann_set_institution       on public.announcements;
drop trigger if exists community_set_institution on public.community_messages;
create trigger cohorts_set_institution   before insert on public.cohorts            for each row execute function public.set_institution();
create trigger events_set_institution    before insert on public.events             for each row execute function public.set_institution();
create trigger ann_set_institution       before insert on public.announcements      for each row execute function public.set_institution();
create trigger community_set_institution before insert on public.community_messages for each row execute function public.set_institution();

-- ============================================================
-- Signup: invite-only for elevated roles, email-domain for students
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  inv       public.invitations%rowtype;
  inst_id   uuid;
  user_role text;
  domain    text;
begin
  domain := lower(split_part(new.email, '@', 2));

  -- 1) A pending invitation decides both institution and role.
  select * into inv
  from public.invitations
  where lower(email) = lower(new.email)
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if inv.id is not null then
    inst_id   := inv.institution_id;
    user_role := inv.role;
    update public.invitations set accepted_at = now() where id = inv.id;
  else
    -- 2) Otherwise the email domain must belong to a member institution.
    select id into inst_id from public.institutions where domain = any(domains) limit 1;

    if inst_id is null then
      raise exception 'SIVP is available to member institutions only. Ask your incubator admin for an invite.';
    end if;

    -- Self-signup is ALWAYS a student. Elevated roles require an invitation.
    -- (Never read role from raw_user_meta_data — that is client-controlled.)
    user_role := 'student';
  end if;

  insert into public.profiles (id, name, email, role, startup, institution_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    user_role,
    new.raw_user_meta_data->>'startup',
    inst_id
  )
  on conflict (id) do nothing;

  return new;
end; $$;

-- Block self-escalation: a user may edit their own profile, but not their
-- role, institution, or funding figure. Admin-only, and NULL auth.uid()
-- (SQL editor / service role) passes so the first admin can be bootstrapped.
create or replace function public.guard_profile_columns()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if (new.role           is distinct from old.role
   or new.institution_id is distinct from old.institution_id
   or new.funding_raised is distinct from old.funding_raised)
   and public.my_role() <> 'admin'
  then
    raise exception 'Only an admin can change role, institution, or funding.';
  end if;
  return new;
end; $$;

drop trigger if exists profiles_guard on public.profiles;
create trigger profiles_guard before update on public.profiles
  for each row execute function public.guard_profile_columns();

-- ============================================================
-- RLS — every policy is now institution-scoped
-- ============================================================
alter table public.institutions enable row level security;
alter table public.invitations  enable row level security;

-- institutions: names are not secret (the apply page lists them); admins manage their own
drop policy if exists "institutions read"   on public.institutions;
drop policy if exists "institutions update" on public.institutions;
create policy "institutions read" on public.institutions for select to anon, authenticated using (true);
create policy "institutions update" on public.institutions for update to authenticated
  using (public.my_role() = 'admin' and id = public.my_institution());

-- invitations: admins of that institution only
drop policy if exists "invites read"   on public.invitations;
drop policy if exists "invites insert" on public.invitations;
drop policy if exists "invites delete" on public.invitations;
create policy "invites read" on public.invitations for select to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution());
create policy "invites insert" on public.invitations for insert to authenticated
  with check (public.my_role() = 'admin' and institution_id = public.my_institution());
create policy "invites delete" on public.invitations for delete to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution());

-- profiles
drop policy if exists "profiles read"   on public.profiles;
drop policy if exists "profiles insert" on public.profiles;
drop policy if exists "profiles update" on public.profiles;
drop policy if exists "profiles delete" on public.profiles;
create policy "profiles read" on public.profiles for select to authenticated
  using (id = auth.uid() or institution_id = public.my_institution());
create policy "profiles insert" on public.profiles for insert to authenticated
  with check (id = auth.uid());
create policy "profiles update" on public.profiles for update to authenticated
  using (id = auth.uid() or (public.my_role() = 'admin' and institution_id = public.my_institution()));
create policy "profiles delete" on public.profiles for delete to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution());

-- cohorts
drop policy if exists "cohorts read"  on public.cohorts;
drop policy if exists "cohorts write" on public.cohorts;
create policy "cohorts read" on public.cohorts for select to authenticated
  using (institution_id = public.my_institution());
create policy "cohorts write" on public.cohorts for all to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution())
  with check (public.my_role() = 'admin');

-- applications: anyone may apply TO a named institution; only its admins read them
drop policy if exists "apps insert" on public.applications;
drop policy if exists "apps read"   on public.applications;
drop policy if exists "apps update" on public.applications;
create policy "apps insert" on public.applications for insert to anon, authenticated
  with check (institution_id is not null);
create policy "apps read" on public.applications for select to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution());
create policy "apps update" on public.applications for update to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution());

-- progress
drop policy if exists "progress read"   on public.progress;
drop policy if exists "progress upsert" on public.progress;
drop policy if exists "progress update" on public.progress;
create policy "progress read" on public.progress for select to authenticated
  using (public.shares_institution(student_id));
create policy "progress upsert" on public.progress for insert to authenticated
  with check (student_id = auth.uid());
create policy "progress update" on public.progress for update to authenticated
  using (student_id = auth.uid() or (public.my_role() = 'admin' and public.shares_institution(student_id)));

-- meetings
drop policy if exists "meetings read"   on public.meetings;
drop policy if exists "meetings insert" on public.meetings;
drop policy if exists "meetings update" on public.meetings;
create policy "meetings read" on public.meetings for select to authenticated
  using ((student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin')
         and public.shares_institution(student_id));
create policy "meetings insert" on public.meetings for insert to authenticated
  with check (student_id = auth.uid());
create policy "meetings update" on public.meetings for update to authenticated
  using ((mentor_id = auth.uid() or public.my_role() = 'admin') and public.shares_institution(student_id));

-- evaluations
drop policy if exists "evals read"   on public.evaluations;
drop policy if exists "evals insert" on public.evaluations;
create policy "evals read" on public.evaluations for select to authenticated
  using ((student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin')
         and public.shares_institution(student_id));
create policy "evals insert" on public.evaluations for insert to authenticated
  with check (public.my_role() in ('mentor','admin') and public.shares_institution(student_id));

-- tasks
drop policy if exists "tasks read"   on public.tasks;
drop policy if exists "tasks insert" on public.tasks;
drop policy if exists "tasks update" on public.tasks;
drop policy if exists "tasks delete" on public.tasks;
create policy "tasks read" on public.tasks for select to authenticated
  using ((student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin')
         and public.shares_institution(student_id));
create policy "tasks insert" on public.tasks for insert to authenticated
  with check (public.my_role() in ('mentor','admin') and public.shares_institution(student_id));
create policy "tasks update" on public.tasks for update to authenticated
  using ((student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin')
         and public.shares_institution(student_id));
create policy "tasks delete" on public.tasks for delete to authenticated
  using ((mentor_id = auth.uid() or public.my_role() = 'admin') and public.shares_institution(student_id));

-- messages (student <-> mentor thread)
drop policy if exists "messages read"   on public.messages;
drop policy if exists "messages insert" on public.messages;
create policy "messages read" on public.messages for select to authenticated
  using (public.shares_institution(student_id)
         and (student_id = auth.uid()
              or public.my_role() = 'admin'
              or exists (select 1 from public.profiles p where p.id = messages.student_id and p.mentor_id = auth.uid())));
create policy "messages insert" on public.messages for insert to authenticated
  with check (sender_id = auth.uid() and public.shares_institution(student_id));

-- resources
drop policy if exists "resources read"   on public.resources;
drop policy if exists "resources insert" on public.resources;
drop policy if exists "resources delete" on public.resources;
create policy "resources read" on public.resources for select to authenticated
  using (public.shares_institution(student_id)
         and (student_id = auth.uid()
              or public.my_role() = 'admin'
              or exists (select 1 from public.profiles p where p.id = resources.student_id and p.mentor_id = auth.uid())));
create policy "resources insert" on public.resources for insert to authenticated
  with check (public.my_role() in ('mentor','admin') and public.shares_institution(student_id));
create policy "resources delete" on public.resources for delete to authenticated
  using (public.my_role() in ('mentor','admin') and public.shares_institution(student_id));

-- events
drop policy if exists "events read"  on public.events;
drop policy if exists "events write" on public.events;
create policy "events read" on public.events for select to authenticated
  using (institution_id = public.my_institution());
create policy "events write" on public.events for all to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution())
  with check (public.my_role() = 'admin');

-- event rsvps
drop policy if exists "rsvps read"   on public.event_rsvps;
drop policy if exists "rsvps insert" on public.event_rsvps;
drop policy if exists "rsvps delete" on public.event_rsvps;
create policy "rsvps read" on public.event_rsvps for select to authenticated
  using (exists (select 1 from public.events e where e.id = event_id and e.institution_id = public.my_institution()));
create policy "rsvps insert" on public.event_rsvps for insert to authenticated
  with check (user_id = auth.uid());
create policy "rsvps delete" on public.event_rsvps for delete to authenticated
  using (user_id = auth.uid());

-- announcements
drop policy if exists "ann read"  on public.announcements;
drop policy if exists "ann write" on public.announcements;
create policy "ann read" on public.announcements for select to authenticated
  using (institution_id = public.my_institution());
create policy "ann write" on public.announcements for all to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution())
  with check (public.my_role() = 'admin');

-- reports
drop policy if exists "reports read"   on public.reports;
drop policy if exists "reports insert" on public.reports;
create policy "reports read" on public.reports for select to authenticated
  using (public.shares_institution(student_id)
         and (student_id = auth.uid()
              or public.my_role() = 'admin'
              or exists (select 1 from public.profiles p where p.id = reports.student_id and p.mentor_id = auth.uid())));
create policy "reports insert" on public.reports for insert to authenticated
  with check (student_id = auth.uid());

-- community chat — this is the one that would have leaked between universities
drop policy if exists "community read"   on public.community_messages;
drop policy if exists "community insert" on public.community_messages;
create policy "community read" on public.community_messages for select to authenticated
  using (institution_id = public.my_institution());
create policy "community insert" on public.community_messages for insert to authenticated
  with check (sender_id = auth.uid());

-- documents + requests
drop policy if exists "docs read"   on public.documents;
drop policy if exists "docs insert" on public.documents;
drop policy if exists "docs delete" on public.documents;
create policy "docs read" on public.documents for select to authenticated
  using (public.shares_institution(student_id)
         and (student_id = auth.uid()
              or public.my_role() = 'admin'
              or exists (select 1 from public.profiles p where p.id = documents.student_id and p.mentor_id = auth.uid())));
create policy "docs insert" on public.documents for insert to authenticated
  with check (student_id = auth.uid());
create policy "docs delete" on public.documents for delete to authenticated
  using (student_id = auth.uid() or (public.my_role() = 'admin' and public.shares_institution(student_id)));

drop policy if exists "docreq read"   on public.document_requests;
drop policy if exists "docreq insert" on public.document_requests;
drop policy if exists "docreq update" on public.document_requests;
create policy "docreq read" on public.document_requests for select to authenticated
  using (public.shares_institution(student_id)
         and (student_id = auth.uid()
              or public.my_role() = 'admin'
              or exists (select 1 from public.profiles p where p.id = document_requests.student_id and p.mentor_id = auth.uid())));
create policy "docreq insert" on public.document_requests for insert to authenticated
  with check (public.my_role() in ('mentor','admin') and public.shares_institution(student_id));
create policy "docreq update" on public.document_requests for update to authenticated
  using (public.shares_institution(student_id)
         and (student_id = auth.uid() or public.my_role() in ('mentor','admin')));

-- ---------- showcase: was public across all tenants; now institution-scoped ----------
drop view if exists public.showcase;
create view public.showcase with (security_invoker = on) as
  select p.id, p.institution_id, p.startup, p.tagline, p.website, p.name as founder,
         coalesce(pr.stage, 'Idea') as stage,
         coalesce(pr.percent, 0) as percent
  from public.profiles p
  left join public.progress pr on pr.student_id = p.id
  where p.role = 'student' and p.startup is not null and p.startup <> '';

revoke all on public.showcase from anon;
grant select on public.showcase to authenticated;

-- ============================================================
-- Bootstrap the first admin (no admin exists to send the first invite).
-- Uncomment, set your email, and run once. Works from the SQL editor
-- because auth.uid() is NULL there, which the guard trigger allows.
-- ============================================================
-- update public.profiles set role = 'admin' where email = 'you@krmangalam.edu.in';
