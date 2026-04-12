-- Student profile id equals profiles.id (seed students 30000000-...-000001..005).
-- Each student linked to the school with the same numeric suffix.

insert into public.student_profiles (
  id,
  index_number,
  major,
  year_of_study,
  school_id
) values
  ('30000000-0000-4000-8000-000000000001', 's000001', 'Informatyka', 3, '50000000-0000-4000-8000-000000000001'),
  ('30000000-0000-4000-8000-000000000002', 's000002', 'Data Science', 2, '50000000-0000-4000-8000-000000000002'),
  ('30000000-0000-4000-8000-000000000003', 's000003', 'Zarządzanie', 4, '50000000-0000-4000-8000-000000000003'),
  ('30000000-0000-4000-8000-000000000004', 's000004', 'Informatyka Stosowana', 1, '50000000-0000-4000-8000-000000000004'),
  ('30000000-0000-4000-8000-000000000005', 's000005', 'Ekonomia', 3, '50000000-0000-4000-8000-000000000005');
