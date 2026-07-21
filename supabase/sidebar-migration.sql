-- ============================================================
-- SIVP — sidebar dashboard migration (ADDITIVE — safe to run on top of schema.sql)
-- Run in: Supabase Dashboard -> SQL Editor -> New query -> Run
-- Adds: community chat, documents + document requests, leaderboard funding,
--       profile phone/avatar, and Storage buckets (documents, avatars).
-- ============================================================

-- ---------- profiles: new columns ----------
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists funding_raised bigint not null default 0;

-- ---------- community chat (whole incubation centre) ----------
create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid references public.profiles(id) on delete set null,
  name text,
  role text,
  text text not null,
  created_at timestamptz default now()
);
alter table public.community_messages enable row level security;
drop policy if exists "community read" on public.community_messages;
drop policy if exists "community insert" on public.community_messages;
create policy "community read"   on public.community_messages for select to authenticated using (true);
create policy "community insert" on public.community_messages for insert to authenticated with check (sender_id = auth.uid());

-- realtime for live chat
alter publication supabase_realtime add table public.community_messages;

-- ---------- document requests (admin/mentor -> student) ----------
create table if not exists public.document_requests (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  requested_by uuid references public.profiles(id) on delete set null,
  by_name text,
  title text not null,
  note text,
  status text not null default 'pending' check (status in ('pending','fulfilled')),
  created_at timestamptz default now()
);
alter table public.document_requests enable row level security;
drop policy if exists "docreq read"   on public.document_requests;
drop policy if exists "docreq insert" on public.document_requests;
drop policy if exists "docreq update" on public.document_requests;
create policy "docreq read" on public.document_requests for select to authenticated
  using (
    student_id = auth.uid()
    or public.my_role() = 'admin'
    or exists (select 1 from public.profiles p where p.id = document_requests.student_id and p.mentor_id = auth.uid())
  );
create policy "docreq insert" on public.document_requests for insert to authenticated
  with check (public.my_role() in ('mentor','admin'));
create policy "docreq update" on public.document_requests for update to authenticated
  using (
    student_id = auth.uid() or public.my_role() = 'admin'
    or exists (select 1 from public.profiles p where p.id = document_requests.student_id and p.mentor_id = auth.uid())
  );

-- ---------- documents (metadata; files live in Storage) ----------
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  uploaded_by uuid references public.profiles(id) on delete set null,
  request_id uuid references public.document_requests(id) on delete set null,
  title text not null,
  file_path text not null,
  file_name text,
  size bigint,
  created_at timestamptz default now()
);
alter table public.documents enable row level security;
drop policy if exists "docs read"   on public.documents;
drop policy if exists "docs insert" on public.documents;
drop policy if exists "docs delete" on public.documents;
create policy "docs read" on public.documents for select to authenticated
  using (
    student_id = auth.uid()
    or public.my_role() = 'admin'
    or exists (select 1 from public.profiles p where p.id = documents.student_id and p.mentor_id = auth.uid())
  );
create policy "docs insert" on public.documents for insert to authenticated
  with check (student_id = auth.uid());
create policy "docs delete" on public.documents for delete to authenticated
  using (student_id = auth.uid() or public.my_role() = 'admin');

-- ============================================================
-- Storage buckets + policies
-- ============================================================
insert into storage.buckets (id, name, public) values ('documents', 'documents', false) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)  on conflict (id) do nothing;

-- documents: files are stored under a "<student_id>/..." path prefix
drop policy if exists "documents upload" on storage.objects;
drop policy if exists "documents read"   on storage.objects;
drop policy if exists "documents delete" on storage.objects;
create policy "documents upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "documents read" on storage.objects for select to authenticated
  using (
    bucket_id = 'documents' and (
      (storage.foldername(name))[1] = auth.uid()::text
      or public.my_role() = 'admin'
      or exists (select 1 from public.profiles p where p.id::text = (storage.foldername(name))[1] and p.mentor_id = auth.uid())
    )
  );
create policy "documents delete" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

-- avatars: public read, owner writes under "<user_id>/..."
drop policy if exists "avatars read"   on storage.objects;
drop policy if exists "avatars write"  on storage.objects;
drop policy if exists "avatars update" on storage.objects;
create policy "avatars read"  on storage.objects for select to public using (bucket_id = 'avatars');
create policy "avatars write" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
