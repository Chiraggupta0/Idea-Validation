-- ============================================================
-- SIVP — Supabase schema
-- Run this whole file in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run (drops and recreates).
-- ============================================================

-- ---------- clean slate ----------
drop table if exists public.event_rsvps cascade;
drop table if exists public.events cascade;
drop table if exists public.announcements cascade;
drop table if exists public.resources cascade;
drop table if exists public.messages cascade;
drop table if exists public.tasks cascade;
drop table if exists public.evaluations cascade;
drop table if exists public.meetings cascade;
drop table if exists public.progress cascade;
drop table if exists public.reports cascade;
drop table if exists public.applications cascade;
drop table if exists public.profiles cascade;
drop table if exists public.cohorts cascade;
drop view if exists public.showcase;

-- ---------- cohorts ----------
create table public.cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- ---------- profiles (extends auth.users) ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null default 'student' check (role in ('student','mentor','admin')),
  startup text,
  tagline text,
  website text,
  expertise text,
  mentor_id uuid references public.profiles(id) on delete set null,
  cohort_id uuid references public.cohorts(id) on delete set null,
  created_at timestamptz default now()
);

-- auto-create a profile whenever someone signs up (email or OAuth)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, email, role, startup)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.raw_user_meta_data->>'startup'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: current user's role (used by RLS policies)
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- ---------- applications (public intake form) ----------
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  startup text,
  stage text,
  pitch text,
  team_size text,
  why text,
  status text not null default 'Applied',
  created_at timestamptz default now()
);

-- ---------- progress ----------
create table public.progress (
  student_id uuid primary key references public.profiles(id) on delete cascade,
  stage text not null default 'Idea',
  percent int not null default 10 check (percent between 0 and 100),
  note text,
  updated_at timestamptz default now()
);

-- ---------- meetings ----------
create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  student_name text,
  date date,
  time text,
  topic text,
  status text not null default 'requested' check (status in ('requested','accepted','declined')),
  created_at timestamptz default now()
);

-- ---------- evaluations ----------
create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  by_name text,
  score int check (score between 0 and 10),
  feedback text,
  created_at timestamptz default now()
);

-- ---------- tasks ----------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  mentor_id uuid references public.profiles(id) on delete set null,
  title text not null,
  done boolean not null default false,
  created_at timestamptz default now()
);

-- ---------- messages (student <-> mentor thread) ----------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  sender_id uuid references public.profiles(id) on delete set null,
  from_role text,
  name text,
  text text not null,
  created_at timestamptz default now()
);

-- ---------- resources ----------
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  url text,
  note text,
  created_at timestamptz default now()
);

-- ---------- events + rsvps ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date,
  time text,
  type text,
  location text,
  description text,
  created_at timestamptz default now()
);

create table public.event_rsvps (
  event_id uuid references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  primary key (event_id, user_id)
);

-- ---------- announcements ----------
create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  created_at timestamptz default now()
);

-- ---------- reports (persisted validation reports) ----------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  startup_name text,
  data jsonb not null,
  created_at timestamptz default now()
);

-- ---------- public showcase view (safe columns only, no emails) ----------
create view public.showcase
with (security_invoker = off) as
  select p.id, p.startup, p.tagline, p.website, p.name as founder,
         coalesce(pr.stage, 'Idea') as stage,
         coalesce(pr.percent, 0) as percent
  from public.profiles p
  left join public.progress pr on pr.student_id = p.id
  where p.role = 'student' and p.startup is not null and p.startup <> '';

grant select on public.showcase to anon, authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles      enable row level security;
alter table public.cohorts       enable row level security;
alter table public.applications  enable row level security;
alter table public.progress      enable row level security;
alter table public.meetings      enable row level security;
alter table public.evaluations   enable row level security;
alter table public.tasks         enable row level security;
alter table public.messages      enable row level security;
alter table public.resources     enable row level security;
alter table public.events        enable row level security;
alter table public.event_rsvps   enable row level security;
alter table public.announcements enable row level security;
alter table public.reports       enable row level security;

-- profiles: any signed-in user can read (needed for mentor lists / admin table)
create policy "profiles read"   on public.profiles for select to authenticated using (true);
create policy "profiles insert" on public.profiles for insert to authenticated with check (id = auth.uid());
create policy "profiles update" on public.profiles for update to authenticated using (id = auth.uid() or public.my_role() = 'admin');
create policy "profiles delete" on public.profiles for delete to authenticated using (public.my_role() = 'admin');

-- cohorts: read by signed-in, managed by admin
create policy "cohorts read"  on public.cohorts for select to authenticated using (true);
create policy "cohorts write" on public.cohorts for all    to authenticated using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- applications: ANYONE can apply (public form); only admins can read/manage
create policy "apps insert" on public.applications for insert to anon, authenticated with check (true);
create policy "apps read"   on public.applications for select to authenticated using (public.my_role() = 'admin');
create policy "apps update" on public.applications for update to authenticated using (public.my_role() = 'admin');

-- progress: readable by signed-in (mentors/admin need it); students write their own
create policy "progress read"   on public.progress for select to authenticated using (true);
create policy "progress upsert" on public.progress for insert to authenticated with check (student_id = auth.uid());
create policy "progress update" on public.progress for update to authenticated using (student_id = auth.uid() or public.my_role() = 'admin');

-- meetings: visible to the student, their mentor, or admin
create policy "meetings read"   on public.meetings for select to authenticated
  using (student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin');
create policy "meetings insert" on public.meetings for insert to authenticated with check (student_id = auth.uid());
create policy "meetings update" on public.meetings for update to authenticated
  using (mentor_id = auth.uid() or public.my_role() = 'admin');

-- evaluations: student sees own; mentors/admin write
create policy "evals read"   on public.evaluations for select to authenticated
  using (student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin');
create policy "evals insert" on public.evaluations for insert to authenticated
  with check (public.my_role() in ('mentor','admin'));

-- tasks: student sees own (and can tick them); mentors/admin manage
create policy "tasks read"   on public.tasks for select to authenticated
  using (student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin');
create policy "tasks insert" on public.tasks for insert to authenticated
  with check (public.my_role() in ('mentor','admin'));
create policy "tasks update" on public.tasks for update to authenticated
  using (student_id = auth.uid() or mentor_id = auth.uid() or public.my_role() = 'admin');
create policy "tasks delete" on public.tasks for delete to authenticated
  using (mentor_id = auth.uid() or public.my_role() = 'admin');

-- messages: the student and their mentor (and admin)
create policy "messages read" on public.messages for select to authenticated
  using (
    student_id = auth.uid()
    or public.my_role() = 'admin'
    or exists (select 1 from public.profiles p where p.id = messages.student_id and p.mentor_id = auth.uid())
  );
create policy "messages insert" on public.messages for insert to authenticated with check (sender_id = auth.uid());

-- resources: student sees own; mentors/admin manage
create policy "resources read"   on public.resources for select to authenticated
  using (
    student_id = auth.uid()
    or public.my_role() = 'admin'
    or exists (select 1 from public.profiles p where p.id = resources.student_id and p.mentor_id = auth.uid())
  );
create policy "resources insert" on public.resources for insert to authenticated
  with check (public.my_role() in ('mentor','admin'));
create policy "resources delete" on public.resources for delete to authenticated
  using (public.my_role() in ('mentor','admin'));

-- events: public to read, admin to manage
create policy "events read"  on public.events for select to anon, authenticated using (true);
create policy "events write" on public.events for all    to authenticated using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- rsvps: signed-in read; users manage their own
create policy "rsvps read"   on public.event_rsvps for select to authenticated using (true);
create policy "rsvps insert" on public.event_rsvps for insert to authenticated with check (user_id = auth.uid());
create policy "rsvps delete" on public.event_rsvps for delete to authenticated using (user_id = auth.uid());

-- announcements: signed-in read, admin manage
create policy "ann read"  on public.announcements for select to authenticated using (true);
create policy "ann write" on public.announcements for all    to authenticated using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

-- reports: owner + their mentor + admin
create policy "reports read" on public.reports for select to authenticated
  using (
    student_id = auth.uid()
    or public.my_role() = 'admin'
    or exists (select 1 from public.profiles p where p.id = reports.student_id and p.mentor_id = auth.uid())
  );
create policy "reports insert" on public.reports for insert to authenticated with check (student_id = auth.uid());

-- ---------- seed a starter cohort ----------
insert into public.cohorts (name) values ('Batch 2026');
