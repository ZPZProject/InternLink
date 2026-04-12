-- Link student_profiles to schools (requires 20260408120000_schools_supervisor applied first).
-- Nullable so existing rows stay valid; onboarding requires a school before dashboard access.

alter table public.student_profiles
  add column school_id uuid references public.schools (id) on delete restrict;
