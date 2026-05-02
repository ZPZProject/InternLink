-- Week 4 (F3): internship documents + private storage bucket

create type public.document_type as enum ('contract', 'internship_log', 'other');

create type public.document_review_status as enum ('pending', 'approved', 'rejected');

create table public.documents (
  id uuid not null primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  type public.document_type not null,
  file_name text not null,
  storage_path text not null,
  file_size_bytes bigint not null check (file_size_bytes > 0 and file_size_bytes <= 10485760),
  mime_type text not null,
  uploaded_at timestamptz not null default now(),
  review_status public.document_review_status not null default 'pending',
  reviewed_at timestamptz,
  supervisor_id uuid references public.profiles (id) on delete set null,
  rejection_reason text,
  constraint documents_storage_path_unique unique (storage_path)
);

create index if not exists documents_application_id_idx
  on public.documents (application_id);

create index if not exists documents_application_review_idx
  on public.documents (application_id, review_status);

alter table public.documents enable row level security;

-- Student: own application and employer accepted (UC3)
create policy documents_student_select on public.documents
for select to authenticated
using (
  exists (
    select 1 from public.applications a
    where a.id = documents.application_id
      and a.student_profile_id = auth.uid()
      and a.status = 'accepted'
  )
);

create policy documents_student_insert on public.documents
for insert to authenticated
with check (
  exists (
    select 1 from public.applications a
    where a.id = documents.application_id
      and a.student_profile_id = auth.uid()
      and a.status = 'accepted'
  )
);

create policy documents_student_delete on public.documents
for delete to authenticated
using (
  exists (
    select 1 from public.applications a
    where a.id = documents.application_id
      and a.student_profile_id = auth.uid()
      and a.status = 'accepted'
  )
  and review_status = 'pending'
);

-- Supervisor / admin read (Week 5 review writes separate)
create policy documents_supervisor_admin_select on public.documents
for select to authenticated
using ((auth.jwt() ->> 'user_role') in ('supervisor', 'admin'));

grant select, insert, delete on table public.documents to authenticated;

-- Private bucket; uploads/downloads via signed URLs (service role) in tRPC
insert into storage.buckets (id, name, public)
values ('application-documents', 'application-documents', false)
on conflict (id) do update set public = excluded.public;
