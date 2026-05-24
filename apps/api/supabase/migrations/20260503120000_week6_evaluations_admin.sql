-- Week 6 (F9, partial F10): evaluations and admin audit log

create table public.evaluations (
  id uuid not null primary key default gen_random_uuid(),
  application_id uuid not null unique references public.applications (id) on delete cascade,
  supervisor_profile_id uuid not null references public.profiles (id) on delete restrict,
  score smallint not null check (score between 2 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists evaluations_supervisor_profile_id_idx
  on public.evaluations (supervisor_profile_id);

alter table public.evaluations enable row level security;

create policy evaluations_student_select on public.evaluations
for select to authenticated
using (
  exists (
    select 1 from public.applications a
    where a.id = evaluations.application_id
      and a.student_profile_id = auth.uid()
  )
);

create policy evaluations_supervisor_admin_select on public.evaluations
for select to authenticated
using ((auth.jwt() ->> 'user_role') in ('supervisor', 'admin'));

create policy evaluations_supervisor_insert on public.evaluations
for insert to authenticated
with check ((auth.jwt() ->> 'user_role') in ('supervisor', 'admin'));

grant select, insert on table public.evaluations to authenticated;

create table public.audit_logs (
  id uuid not null primary key default gen_random_uuid(),
  actor_profile_id uuid not null references public.profiles (id) on delete restrict,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_actor_profile_id_idx
  on public.audit_logs (actor_profile_id);

create index if not exists audit_logs_entity_idx
  on public.audit_logs (entity_type, entity_id, created_at desc);

alter table public.audit_logs enable row level security;

create policy audit_logs_admin_select on public.audit_logs
for select to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

create policy audit_logs_admin_insert on public.audit_logs
for insert to authenticated
with check ((auth.jwt() ->> 'user_role') = 'admin');

grant select, insert on table public.audit_logs to authenticated;
