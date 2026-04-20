-- Schools and supervisor membership. Supervisors create pending schools or join existing schools (RLS allows all authenticated users to read schools for onboarding).

create type public.school_approval_status as enum ('pending', 'approved', 'rejected');

create table public.schools (
  id uuid not null primary key default gen_random_uuid(),
  name text not null,
  address text,
  website text,
  approval_status public.school_approval_status not null default 'pending',
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger schools_set_updated_at
  before update on public.schools
  for each row
  execute function public.set_profiles_updated_at();

create table public.school_members (
  profile_id uuid not null primary key references public.profiles (id) on delete cascade,
  school_id uuid not null references public.schools (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index school_members_school_id_idx on public.school_members (school_id);

alter table public.schools enable row level security;
alter table public.school_members enable row level security;

create policy schools_select_authenticated
on public.schools
for select
to authenticated
using (true);

create policy schools_insert_supervisor_pending
on public.schools
for insert
to authenticated
with check (
  (auth.jwt() ->> 'user_role') = 'supervisor'
  and created_by_profile_id = auth.uid()
  and approval_status = 'pending'
);

create policy schools_delete_creator_pending
on public.schools
for delete
to authenticated
using (
  created_by_profile_id = auth.uid()
  and approval_status = 'pending'
);

create policy schools_update_admin
on public.schools
for update
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

create policy schools_update_creator_pending
on public.schools
for update
to authenticated
using (
  created_by_profile_id = auth.uid()
  and approval_status = 'pending'
)
with check (
  created_by_profile_id = auth.uid()
  and approval_status = 'pending'
);

create policy school_members_select_own
on public.school_members
for select
to authenticated
using (profile_id = auth.uid());

create policy school_members_select_admin
on public.school_members
for select
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

create policy school_members_insert
on public.school_members
for insert
to authenticated
with check (
  profile_id = auth.uid()
  and (auth.jwt() ->> 'user_role') = 'supervisor'
  and exists (
    select 1 from public.schools s where s.id = school_id
  )
);

grant select, insert, update, delete on table public.schools to authenticated;
grant select, insert on table public.school_members to authenticated;
