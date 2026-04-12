-- One company per employer; IDs align with auth users 10000000-...-000001..005.

insert into public.companies (
  id,
  name,
  tax_id,
  address,
  contact_person,
  approval_status,
  created_by_profile_id
) values
  (
    '40000000-0000-4000-8000-000000000001',
    'Seed Tech Sp. z o.o.',
    '5250000001',
    'ul. Marszałkowska 1, 00-001 Warszawa',
    'Anna Kowalska',
    'approved',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    'Blue River Software',
    '5250000002',
    'ul. Długa 12, 80-000 Gdańsk',
    'Piotr Nowak',
    'approved',
    '10000000-0000-4000-8000-000000000002'
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    'Northwind Polska',
    '5250000003',
    'ul. Piotrkowska 44, 90-000 Łódź',
    'Katarzyna Wiśniewska',
    'approved',
    '10000000-0000-4000-8000-000000000003'
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    'Acme Internships PL',
    '5250000004',
    'ul. Floriańska 9, 31-000 Kraków',
    'Tomasz Wójcik',
    'approved',
    '10000000-0000-4000-8000-000000000004'
  ),
  (
    '40000000-0000-4000-8000-000000000005',
    'GreenByte Labs',
    '5250000005',
    'ul. Święty Marcin 50, 61-000 Poznań',
    'Magdalena Krawczyk',
    'approved',
    '10000000-0000-4000-8000-000000000005'
  );

insert into public.company_members (profile_id, company_id) values
  ('10000000-0000-4000-8000-000000000001', '40000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002', '40000000-0000-4000-8000-000000000002'),
  ('10000000-0000-4000-8000-000000000003', '40000000-0000-4000-8000-000000000003'),
  ('10000000-0000-4000-8000-000000000004', '40000000-0000-4000-8000-000000000004'),
  ('10000000-0000-4000-8000-000000000005', '40000000-0000-4000-8000-000000000005');
