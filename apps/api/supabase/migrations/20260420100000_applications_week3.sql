-- Week 3: Applications full schema
-- Add columns, RLS policies, and helper functions for F2, F4, F6, F7

-- Add missing columns to applications
alter table public.applications
add column if not exists motivation_letter text default '',
add column if not exists applied_at timestamptz,
add column if not exists reviewed_at timestamptz,
add column if not exists employer_rejection_reason text;

-- Function: count_active_applications for limit validation
create or replace function public.count_active_applications(p_student_profile_id uuid)
returns int as $$
  select count(*)::int
  from public.applications a
  where a.student_profile_id = p_student_profile_id
    and a.status in ('pending', 'accepted');
$$ language sql stable;

-- Applications RLS

-- Student can see their own applications
drop policy if exists applications_student_select on public.applications;
create policy applications_student_select on public.applications
for select to authenticated
using (
  exists (
    select 1 from public.student_profiles sp
    where sp.id = auth.uid() and sp.id = student_profile_id
  )
);

-- Student can insert new application (basic check)
drop policy if exists applications_student_insert on public.applications;
create policy applications_student_insert on public.applications
for insert to authenticated
with check (
  exists (
    select 1 from public.student_profiles sp
    where sp.id = auth.uid() and sp.id = student_profile_id
  )
);

-- Employer can see applications for their offers
drop policy if exists applications_employer_select on public.applications;
create policy applications_employer_select on public.applications
for select to authenticated
using (
  exists (
    select 1 from public.company_members cm
    join public.internship_offers io on io.company_id = cm.company_id
    where cm.profile_id = auth.uid() and io.id = offer_id
  )
);

-- Employer can update (accept/reject) applications for their offers
drop policy if exists applications_employer_update on public.applications;
create policy applications_employer_update on public.applications
for update to authenticated
using (
  exists (
    select 1 from public.company_members cm
    join public.internship_offers io on io.company_id = cm.company_id
    where cm.profile_id = auth.uid() and io.id = offer_id
  )
);

-- Supervisor can see all applications
drop policy if exists applications_supervisor_select on public.applications;
create policy applications_supervisor_select on public.applications
for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('supervisor', 'admin')
  )
);

-- Grant permissions
grant select, insert, update on table public.applications to authenticated;

-- Indexes for common queries
drop index if exists applications_student_profile_id_idx;
create index applications_student_profile_id_idx on public.applications(student_profile_id);

drop index if exists applications_offer_id_idx;
create index applications_offer_id_idx on public.applications(offer_id);

drop index if exists applications_status_idx;
create index applications_status_idx on public.applications(status);