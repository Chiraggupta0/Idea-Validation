-- ============================================================
-- SIVP — demo accounts seed
--
-- STEP 1 (do this FIRST, in the Supabase Dashboard):
--   Authentication -> Users -> "Add user" -> "Create new user"
--   Tick "Auto Confirm User" for each, and create these three:
--     student@sivp.dev  /  student123
--     mentor@sivp.dev   /  mentor123
--     admin@sivp.dev    /  admin123
--
-- STEP 2: run this file in the SQL Editor to give them names, roles and demo data.
-- Safe to re-run.
-- ============================================================

-- roles + profile details
update public.profiles
   set name = 'Rahul Sharma', role = 'student',
       startup = 'PawPair', tagline = 'On-demand verified pet-sitting marketplace.'
 where email = 'student@sivp.dev';

update public.profiles
   set name = 'Dr. Anita Rao', role = 'mentor',
       expertise = 'SaaS · GTM · Fundraising'
 where email = 'mentor@sivp.dev';

update public.profiles
   set name = 'Incubator Admin', role = 'admin'
 where email = 'admin@sivp.dev';

-- link the demo student to the demo mentor
update public.profiles
   set mentor_id = (select id from public.profiles where email = 'mentor@sivp.dev')
 where email = 'student@sivp.dev';

-- put the demo student in the starter cohort
update public.profiles
   set cohort_id = (select id from public.cohorts order by created_at limit 1)
 where email = 'student@sivp.dev';

-- give the demo student some progress so dashboards/showcase look alive
insert into public.progress (student_id, stage, percent, note)
select id, 'MVP', 45, 'Shipped the booking flow and onboarded 12 pilot sitters this week.'
  from public.profiles where email = 'student@sivp.dev'
on conflict (student_id) do update
  set stage = 'MVP', percent = 45,
      note = 'Shipped the booking flow and onboarded 12 pilot sitters this week.',
      updated_at = now();

-- a sample announcement + event so the demo isn't empty
insert into public.announcements (title, body)
select 'Demo Day is coming', 'Pitch practice sessions start next week — book a slot with your mentor.'
where not exists (select 1 from public.announcements);

insert into public.events (title, date, time, type, location, description)
select 'Pitch Practice Workshop', current_date + 7, '16:00', 'Workshop', 'Incubation Centre, Block A',
       'Hands-on session refining your 3-minute pitch with mentor feedback.'
where not exists (select 1 from public.events);

-- check it worked
select email, name, role, startup, mentor_id from public.profiles order by role;
