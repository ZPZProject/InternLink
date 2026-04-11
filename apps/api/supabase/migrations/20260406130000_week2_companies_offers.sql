-- Week 2: companies (replacing employer_profiles), employer onboarding, internship offers.
-- New companies default to approval_status = pending; admins approve/reject out of band (no admin UI in this iteration).
-- Employers cannot create offers unless their company is approved (RLS + tRPC).
-- Company + membership creation: INSERT companies then company_members in application code (tRPC), with compensating delete on failure.

create type public.company_approval_status as enum ('pending', 'approved', 'rejected');

create type public.application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create table public.companies (
  id uuid not null primary key default gen_random_uuid(),
  name text not null,
  tax_id text,
  address text,
  contact_person text,
  approval_status public.company_approval_status not null default 'pending',
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger companies_set_updated_at
  before update on public.companies
  for each row
  execute function public.set_profiles_updated_at();

-- One company per employer (MVP): profile_id is PK.
create table public.company_members (
  profile_id uuid not null primary key references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete restrict,
  created_at timestamptz not null default now()
);

create index company_members_company_id_idx on public.company_members (company_id);

-- 1:1 extension of profiles for students (id = profiles.id).
create table public.student_profiles (
  id uuid not null primary key references public.profiles (id) on delete cascade,
  index_number text,
  major text,
  year_of_study int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row
  execute function public.set_profiles_updated_at();

create table public.internship_offers (
  id uuid not null primary key default gen_random_uuid(),
  company_id uuid not null references public.companies (id) on delete cascade,
  created_by_profile_id uuid references public.profiles (id) on delete set null,
  title text not null,
  description text not null default '',
  requirements text,
  location text not null default '',
  number_of_positions int not null default 1 check (number_of_positions >= 1),
  start_date date not null,
  end_date date not null,
  application_deadline date,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (end_date >= start_date)
);

create trigger internship_offers_set_updated_at
  before update on public.internship_offers
  for each row
  execute function public.set_profiles_updated_at();

create index internship_offers_active_created_idx
  on public.internship_offers (is_active, created_at desc);

create index internship_offers_company_id_idx on public.internship_offers (company_id);
create index internship_offers_location_idx on public.internship_offers (location);

create table public.applications (
  id uuid not null primary key default gen_random_uuid(),
  offer_id uuid not null references public.internship_offers (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (offer_id, student_profile_id)
);

-- approval_status: only admins may move a company off "pending" (see UPDATE policies below).
-- companies_update_creator_pending requires the new row to stay approval_status = 'pending'.
-- companies_update_admin allows full updates for JWT user_role = admin.

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.student_profiles enable row level security;
alter table public.internship_offers enable row level security;
alter table public.applications enable row level security;

-- companies SELECT: policies are OR'd — e.g. students see approved; creators/members see their row; admins see all.
create policy companies_select_approved
on public.companies
for select
to authenticated
using (approval_status = 'approved');

create policy companies_select_member_or_creator
on public.companies
for select
to authenticated
using (
  created_by_profile_id = auth.uid()
  or exists (
    select 1
    from public.company_members m
    where m.company_id = companies.id
      and m.profile_id = auth.uid()
  )
);

create policy companies_select_admin
on public.companies
for select
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

create policy companies_insert_employer_pending
on public.companies
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer'
  )
  and created_by_profile_id = auth.uid()
  and approval_status = 'pending'
);

create policy companies_delete_creator_pending
on public.companies
for delete
to authenticated
using (
  created_by_profile_id = auth.uid()
  and approval_status = 'pending'
);

create policy companies_update_admin
on public.companies
for update
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

create policy companies_update_creator_pending
on public.companies
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

-- company_members
create policy company_members_select_own
on public.company_members
for select
to authenticated
using (profile_id = auth.uid());

create policy company_members_select_admin
on public.company_members
for select
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

-- Join approved company, or link to your own pending company after INSERT companies (tRPC).
create policy company_members_insert
on public.company_members
for insert
to authenticated
with check (
  profile_id = auth.uid()
  and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'employer'
  )
  and (
    exists (
      select 1
      from public.companies c
      where c.id = company_id
        and c.approval_status = 'approved'
    )
    or exists (
      select 1
      from public.companies c
      where c.id = company_id
        and c.approval_status = 'pending'
        and c.created_by_profile_id = auth.uid()
    )
  )
);

-- internship_offers
create policy offers_select_active
on public.internship_offers
for select
to authenticated
using (is_active = true);

create policy offers_select_company_member
on public.internship_offers
for select
to authenticated
using (
  exists (
    select 1
    from public.company_members m
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
  )
);

create policy offers_insert_approved_member
on public.internship_offers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_members m
    join public.companies c on c.id = m.company_id
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
      and c.approval_status = 'approved'
  )
);

create policy offers_update_approved_member
on public.internship_offers
for update
to authenticated
using (
  exists (
    select 1
    from public.company_members m
    join public.companies c on c.id = m.company_id
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
      and c.approval_status = 'approved'
  )
)
with check (
  exists (
    select 1
    from public.company_members m
    join public.companies c on c.id = m.company_id
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
      and c.approval_status = 'approved'
  )
);

create policy offers_delete_approved_member
on public.internship_offers
for delete
to authenticated
using (
  exists (
    select 1
    from public.company_members m
    join public.companies c on c.id = m.company_id
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
      and c.approval_status = 'approved'
  )
);

-- student_profiles (skeleton for week 3)
create policy student_profiles_select_own
on public.student_profiles
for select
to authenticated
using (id = auth.uid());

create policy student_profiles_insert_student
on public.student_profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and exists (
    select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student'
  )
);

create policy student_profiles_update_own
on public.student_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- applications: RLS on, no policies yet (week 3).

grant select, insert, update, delete on table public.companies to authenticated;
grant select, insert on table public.company_members to authenticated;
grant select, insert, update, delete on table public.student_profiles to authenticated;
grant select, insert, update, delete on table public.internship_offers to authenticated;
grant select on table public.applications to authenticated;
