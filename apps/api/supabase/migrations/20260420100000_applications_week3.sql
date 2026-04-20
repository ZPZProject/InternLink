-- Applications: extra columns, RLS, indexes

alter table public.applications
  add column if not exists motivation_letter text default '',
  add column if not exists applied_at timestamptz,
  add column if not exists reviewed_at timestamptz,
  add column if not exists employer_rejection_reason text;

-- applications RLS

drop policy if exists applications_student_select on public.applications;
create policy applications_student_select on public.applications
for select to authenticated
using (student_profile_id = auth.uid());

drop policy if exists applications_student_insert on public.applications;
create policy applications_student_insert on public.applications
for insert to authenticated
with check (student_profile_id = auth.uid());

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

drop policy if exists applications_supervisor_select on public.applications;
create policy applications_supervisor_select on public.applications
for select to authenticated
using ((auth.jwt() ->> 'user_role') in ('supervisor', 'admin'));

-- Nested selects (e.g. byOffer) need RLS on related tables, not only applications.

drop policy if exists student_profiles_select_employer_applicants on public.student_profiles;
create policy student_profiles_select_employer_applicants on public.student_profiles
for select to authenticated
using (
  exists (
    select 1
    from public.applications a
    join public.internship_offers io on io.id = a.offer_id
    join public.company_members cm on cm.company_id = io.company_id
    where a.student_profile_id = student_profiles.id
      and cm.profile_id = auth.uid()
  )
);

drop policy if exists profiles_select_employer_applicants on public.profiles;
create policy profiles_select_employer_applicants on public.profiles
for select to authenticated
using (
  exists (
    select 1
    from public.applications a
    join public.internship_offers io on io.id = a.offer_id
    join public.company_members cm on cm.company_id = io.company_id
    where a.student_profile_id = profiles.id
      and cm.profile_id = auth.uid()
  )
);

-- Supervisors read applicants via JWT (no subquery into profiles).
drop policy if exists student_profiles_select_supervisor_applicants on public.student_profiles;
create policy student_profiles_select_supervisor_applicants on public.student_profiles
for select to authenticated
using (
  (auth.jwt() ->> 'user_role') in ('supervisor', 'admin')
  and exists (
    select 1 from public.applications a
    where a.student_profile_id = student_profiles.id
  )
);

drop policy if exists profiles_select_supervisor_applicants on public.profiles;
create policy profiles_select_supervisor_applicants on public.profiles
for select to authenticated
using (
  (auth.jwt() ->> 'user_role') in ('supervisor', 'admin')
  and exists (
    select 1 from public.applications a
    where a.student_profile_id = profiles.id
  )
);

grant select, insert, update on table public.applications to authenticated;

drop index if exists applications_status_idx;

create index if not exists applications_student_profile_id_idx
  on public.applications (student_profile_id);
create index if not exists applications_offer_id_idx
  on public.applications (offer_id);
