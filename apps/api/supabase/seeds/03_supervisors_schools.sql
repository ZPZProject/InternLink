-- One school per supervisor; IDs align with auth users 20000000-...-000001..005.

insert into public.schools (
  id,
  name,
  address,
  website,
  approval_status,
  created_by_profile_id
) values
  (
    '50000000-0000-4000-8000-000000000001',
    'Uniwersytet Seed Warszawa',
    'ul. Krakowskie Przedmieście 26, 00-927 Warszawa',
    'https://seed-uw.example.edu',
    'approved',
    '20000000-0000-4000-8000-000000000001'
  ),
  (
    '50000000-0000-4000-8000-000000000002',
    'Politechnika Seed Gdańsk',
    'ul. Narutowicza 11/12, 80-233 Gdańsk',
    'https://seed-pg.example.edu',
    'approved',
    '20000000-0000-4000-8000-000000000002'
  ),
  (
    '50000000-0000-4000-8000-000000000003',
    'Uniwersytet Seed Łódzki',
    'ul. Kopcińskiego 8, 90-072 Łódź',
    'https://seed-uni-lodz.example.edu',
    'approved',
    '20000000-0000-4000-8000-000000000003'
  ),
  (
    '50000000-0000-4000-8000-000000000004',
    'Akademia Seed Kraków',
    'ul. Reymonta 4, 30-059 Kraków',
    'https://seed-agh.example.edu',
    'approved',
    '20000000-0000-4000-8000-000000000004'
  ),
  (
    '50000000-0000-4000-8000-000000000005',
    'Uniwersytet Seed Poznański',
    'ul. Wieniawskiego 1, 61-712 Poznań',
    'https://seed-put.example.edu',
    'approved',
    '20000000-0000-4000-8000-000000000005'
  );

insert into public.school_members (profile_id, school_id) values
  ('20000000-0000-4000-8000-000000000001', '50000000-0000-4000-8000-000000000001'),
  ('20000000-0000-4000-8000-000000000002', '50000000-0000-4000-8000-000000000002'),
  ('20000000-0000-4000-8000-000000000003', '50000000-0000-4000-8000-000000000003'),
  ('20000000-0000-4000-8000-000000000004', '50000000-0000-4000-8000-000000000004'),
  ('20000000-0000-4000-8000-000000000005', '50000000-0000-4000-8000-000000000005');
