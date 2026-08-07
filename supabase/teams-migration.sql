-- ============================================================
-- SIVP — teams, achievements, engagement, sector/stage taxonomy
-- Run in: Supabase SQL Editor, AFTER multi-tenant-migration.sql
-- Additive and safe to re-run.
--
-- Until now a startup lived on the founder's profile (profiles.startup), so a
-- startup could only ever have one person. This introduces the startup as its
-- own entity with a founding team, and hangs achievements, sector/stage and
-- engagement tracking off it.
--
-- profiles.startup is intentionally left in place: existing dashboards still
-- read it, and it is backfilled into teams below rather than dropped.
-- ============================================================

-- ---------- teams (a startup and its founders) ----------
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade,
  name text not null,
  tagline text,
  website text,
  sector text,
  stage text not null default 'Idea',
  funding_raised bigint not null default 0,
  created_at timestamptz default now()
);

create table if not exists public.team_members (
  team_id uuid not null references public.teams(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'co-founder' check (role in ('founder','co-founder')),
  joined_at timestamptz default now(),
  primary key (team_id, profile_id)
);
-- A person belongs to at most one startup.
create unique index if not exists team_members_one_team_per_person
  on public.team_members (profile_id);

-- ---------- achievements ----------
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  institution_id uuid references public.institutions(id) on delete cascade,
  type text not null default 'Other'
    check (type in ('Funding','Patent','Hackathon','Press','Award','Partnership','Other')),
  title text not null,
  description text,
  amount bigint,              -- for Funding, in rupees
  happened_on date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

-- ---------- backfill: one team per founder who already had a startup ----------
do $$
declare r record; new_team uuid;
begin
  for r in
    select p.id, p.startup, p.tagline, p.website, p.institution_id, p.funding_raised,
           coalesce(pr.stage, 'Idea') as stage
    from public.profiles p
    left join public.progress pr on pr.student_id = p.id
    where p.role = 'student'
      and p.startup is not null and p.startup <> ''
      and not exists (select 1 from public.team_members tm where tm.profile_id = p.id)
  loop
    insert into public.teams (institution_id, name, tagline, website, stage, funding_raised)
    values (r.institution_id, r.startup, r.tagline, r.website, r.stage, coalesce(r.funding_raised, 0))
    returning id into new_team;

    insert into public.team_members (team_id, profile_id, role)
    values (new_team, r.id, 'founder');
  end loop;
end $$;

-- ---------- stamp institution automatically ----------
drop trigger if exists teams_set_institution on public.teams;
drop trigger if exists achievements_set_institution on public.achievements;
create trigger teams_set_institution before insert on public.teams
  for each row execute function public.set_institution();
create trigger achievements_set_institution before insert on public.achievements
  for each row execute function public.set_institution();

-- ---------- helper: is the caller on this team? ----------
create or replace function public.on_team(target_team uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.team_members
    where team_id = target_team and profile_id = auth.uid()
  );
$$;

-- ---------- engagement: how long since each team last met a mentor ----------
-- Mentor interaction is the health signal an incubator actually cares about;
-- surfaced so mentors/admins can spot startups going quiet.
create or replace view public.team_engagement with (security_invoker = on) as
  select
    t.id           as team_id,
    t.institution_id,
    t.name         as team_name,
    t.stage,
    t.funding_raised,
    max(m.date)    as last_meeting,
    (current_date - max(m.date))                   as days_since_meeting,
    count(m.id) filter (where m.status = 'accepted') as accepted_meetings,
    max(e.created_at)                              as last_evaluation
  from public.teams t
  left join public.team_members tm on tm.team_id = t.id
  left join public.meetings   m on m.student_id = tm.profile_id
  left join public.evaluations e on e.student_id = tm.profile_id
  group by t.id, t.institution_id, t.name, t.stage, t.funding_raised;

grant select on public.team_engagement to authenticated;

-- ============================================================
-- RLS
-- ============================================================
alter table public.teams        enable row level security;
alter table public.team_members enable row level security;
alter table public.achievements enable row level security;

-- teams: visible across the institution; editable by its own members or an admin
drop policy if exists "teams read"   on public.teams;
drop policy if exists "teams insert" on public.teams;
drop policy if exists "teams update" on public.teams;
drop policy if exists "teams delete" on public.teams;
create policy "teams read" on public.teams for select to authenticated
  using (institution_id = public.my_institution());
create policy "teams insert" on public.teams for insert to authenticated
  with check (institution_id = public.my_institution());
create policy "teams update" on public.teams for update to authenticated
  using (institution_id = public.my_institution()
         and (public.on_team(id) or public.my_role() in ('mentor','admin')));
create policy "teams delete" on public.teams for delete to authenticated
  using (public.my_role() = 'admin' and institution_id = public.my_institution());

-- team_members: readable within the institution; you add yourself, admins manage anyone
drop policy if exists "team members read"   on public.team_members;
drop policy if exists "team members insert" on public.team_members;
drop policy if exists "team members delete" on public.team_members;
create policy "team members read" on public.team_members for select to authenticated
  using (exists (select 1 from public.teams t
                 where t.id = team_id and t.institution_id = public.my_institution()));
create policy "team members insert" on public.team_members for insert to authenticated
  with check (profile_id = auth.uid() or public.my_role() = 'admin');
create policy "team members delete" on public.team_members for delete to authenticated
  using (profile_id = auth.uid() or public.my_role() = 'admin');

-- achievements: institution-wide read; the team or staff can add
drop policy if exists "achievements read"   on public.achievements;
drop policy if exists "achievements insert" on public.achievements;
drop policy if exists "achievements delete" on public.achievements;
create policy "achievements read" on public.achievements for select to authenticated
  using (institution_id = public.my_institution());
create policy "achievements insert" on public.achievements for insert to authenticated
  with check (institution_id = public.my_institution()
              and (public.on_team(team_id) or public.my_role() in ('mentor','admin')));
create policy "achievements delete" on public.achievements for delete to authenticated
  using (public.on_team(team_id) or public.my_role() = 'admin');

-- Funding is a leaderboard input, so founders must not be able to inflate it.
create or replace function public.guard_team_funding()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.funding_raised is distinct from old.funding_raised
     and public.my_role() not in ('mentor','admin')
  then
    raise exception 'Only a mentor or admin can change funding raised.';
  end if;
  return new;
end; $$;

drop trigger if exists teams_guard_funding on public.teams;
create trigger teams_guard_funding before update on public.teams
  for each row execute function public.guard_team_funding();
