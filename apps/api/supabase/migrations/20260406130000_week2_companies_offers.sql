-- Week 2: companies (replacing employer_profiles), employer onboarding, internship offers.
-- New companies default to approval_status = pending; admins approve/reject out of band (no admin UI in this iteration).
-- Company members may manage offers for their company regardless of approval_status (RLS for now).
-- Company + membership creation: INSERT companies then company_members in application code (tRPC), with compensating delete on failure.

create type public.company_approval_status as enum ('pending', 'approved', 'rejected');

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

-- student_profiles, applications: 20260409103000_student_profiles_applications.sql (after schools).

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

alter table public.companies enable row level security;
alter table public.company_members enable row level security;
alter table public.internship_offers enable row level security;

-- companies: SELECT policies are OR'd (approved for students; own company for creators/members; all for admins).
-- UPDATE: only admins may move approval off pending; creators may update while still pending.
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
  (auth.jwt() ->> 'user_role') = 'employer'
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

-- Link to any existing company (approval_status does not gate membership for now).
create policy company_members_insert
on public.company_members
for insert
to authenticated
with check (
  profile_id = auth.uid()
  and (auth.jwt() ->> 'user_role') = 'employer'
  and exists (
    select 1 from public.companies c where c.id = company_id
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

create policy offers_insert_company_member
on public.internship_offers
for insert
to authenticated
with check (
  exists (
    select 1
    from public.company_members m
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
  )
);

create policy offers_update_company_member
on public.internship_offers
for update
to authenticated
using (
  exists (
    select 1
    from public.company_members m
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
  )
)
with check (
  exists (
    select 1
    from public.company_members m
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
  )
);

create policy offers_delete_company_member
on public.internship_offers
for delete
to authenticated
using (
  exists (
    select 1
    from public.company_members m
    where m.profile_id = auth.uid()
      and m.company_id = internship_offers.company_id
  )
);

grant select, insert, update, delete on table public.companies to authenticated;
grant select, insert on table public.company_members to authenticated;
grant select, insert, update, delete on table public.internship_offers to authenticated;
