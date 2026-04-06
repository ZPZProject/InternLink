-- InternLink week 1: profiles, signup trigger, custom access token hook (JWT user_role), RLS.
-- Schema follows Supabase guidance: profiles.id = auth.users.id (PK + FK), not a separate user_id.
-- https://supabase.com/docs/guides/auth/managing-user-data
-- After apply: enable Custom Access Token hook in Dashboard (Auth > Hooks) if not using config.toml.

create type public.user_role as enum ('student', 'employer', 'supervisor', 'admin');

create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  role public.user_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

create or replace function public.profiles_enforce_immutability()
returns trigger
language plpgsql
as $$
declare
  is_admin boolean;
begin
  if old.id is distinct from new.id then
    raise exception 'profile id cannot be changed';
  end if;

  if old.role is distinct from new.role then
    select exists (
      select 1
      from public.profiles ap
      where ap.id = auth.uid()
        and ap.role = 'admin'
    )
    into is_admin;

    if not coalesce(is_admin, false) then
      raise exception 'only an admin can change role';
    end if;
  end if;

  return new;
end;
$$;

create trigger profiles_enforce_immutability
  before update on public.profiles
  for each row
  execute function public.profiles_enforce_immutability();

-- Sign-up: map raw_user_meta_data (options.data) into profile.
-- Self-service roles: student, employer, supervisor. Admin is never accepted from client metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta_role text;
  assigned_role public.user_role;
begin
  meta_role := coalesce(new.raw_user_meta_data ->> 'role', '');

  if meta_role in ('student', 'employer', 'supervisor') then
    assigned_role := meta_role::public.user_role;
  else
    assigned_role := 'student';
  end if;

  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'first_name', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'last_name', '')), ''),
    assigned_role
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- JWT claims: user_role + is_active (do not overwrite Supabase reserved claim "role" = anon/authenticated)
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  app_role public.user_role;
  active boolean;
begin
  select p.role, p.is_active
  into app_role, active
  from public.profiles p
  where p.id = (event ->> 'user_id')::uuid;

  claims := coalesce(event -> 'claims', '{}'::jsonb);

  if app_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(app_role::text));
  else
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb);
  end if;

  if active is not null then
    claims := jsonb_set(claims, '{is_active}', to_jsonb(active));
  else
    claims := jsonb_set(claims, '{is_active}', 'true'::jsonb);
  end if;

  return jsonb_set(event, '{claims}', claims);
end;
$$;

grant usage on schema public to supabase_auth_admin;

grant execute on function public.custom_access_token_hook to supabase_auth_admin;

revoke execute on function public.custom_access_token_hook from authenticated, anon, public;

grant select on table public.profiles to supabase_auth_admin;

revoke all on table public.profiles from anon, public;

grant select, update on table public.profiles to authenticated;

alter table public.profiles enable row level security;

create policy "profiles_select_auth_admin"
on public.profiles
for select
to supabase_auth_admin
using (true);

create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "profiles_select_admin"
on public.profiles
for select
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "profiles_update_admin"
on public.profiles
for update
to authenticated
using ((auth.jwt() ->> 'user_role') = 'admin');
