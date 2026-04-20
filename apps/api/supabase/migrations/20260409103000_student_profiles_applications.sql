-- Student profiles (1:1 with profiles), application_status enum, and internship applications.
-- After schools so student_profiles.school_id references public.schools without ALTER.
-- Prerequisites: public.profiles, public.schools, public.internship_offers, public.set_profiles_updated_at.

create type public.application_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');

create table public.student_profiles (
  id uuid not null primary key references public.profiles (id) on delete cascade,
  index_number text,
  major text,
  year_of_study int,
  school_id uuid references public.schools (id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger student_profiles_set_updated_at
  before update on public.student_profiles
  for each row
  execute function public.set_profiles_updated_at();

create table public.applications (
  id uuid not null primary key default gen_random_uuid(),
  offer_id uuid not null references public.internship_offers (id) on delete cascade,
  student_profile_id uuid not null references public.student_profiles (id) on delete cascade,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (offer_id, student_profile_id)
);

alter table public.student_profiles enable row level security;
alter table public.applications enable row level security;

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
  and (auth.jwt() ->> 'user_role') = 'student'
);

create policy student_profiles_update_own
on public.student_profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- applications: RLS enabled; row policies to be added when applying from the app.

grant select, insert, update, delete on table public.student_profiles to authenticated;
grant select on table public.applications to authenticated;
