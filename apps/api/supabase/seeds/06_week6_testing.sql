-- Week 6 testing data: applications, documents, evaluations, and one inactive user.
-- Password for all users remains `password123`.
-- Key accounts:
--   admin1@seed.internlink.local
--   supervisor1@seed.internlink.local
--   student1@seed.internlink.local .. student5@seed.internlink.local
--
-- Seeded scenarios:
--   student1: accepted, all docs approved, no evaluation yet -> should appear in /supervisor/evaluations
--   student1: second pending application -> useful for student list/status checks
--   student2: accepted, all docs approved, already evaluated -> should not appear in evaluation queue
--   student3: accepted, one document still pending -> should not appear in evaluation queue
--   student4: accepted, one document rejected -> should not appear in evaluation queue
--   student4: separate accepted application with no documents -> should not appear in evaluation queue
--   student5: rejected application, inactive profile -> useful for admin activation tests

insert into public.applications (
  id,
  offer_id,
  student_profile_id,
  motivation_letter,
  status,
  applied_at,
  reviewed_at,
  employer_rejection_reason
) values
  (
    '70000000-0000-4000-8000-000000000001',
    '60000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Chcę rozwijać się w backendzie i dobrze czuję się w TypeScript.',
    'accepted',
    '2026-05-01T10:00:00Z',
    '2026-05-04T12:00:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    '60000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000002',
    'Frontend i praca z komponentami to kierunek, w którym chcę iść.',
    'accepted',
    '2026-05-02T09:30:00Z',
    '2026-05-05T14:00:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    '60000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000003',
    'Interesuje mnie analiza danych i praktyczne projekty z Pythonem.',
    'accepted',
    '2026-05-03T08:45:00Z',
    '2026-05-06T11:15:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000004',
    '60000000-0000-4000-8000-000000000007',
    '30000000-0000-4000-8000-000000000004',
    'Szukam pierwszej praktyki full-stack i chcę pracować end-to-end.',
    'accepted',
    '2026-05-04T13:20:00Z',
    '2026-05-07T10:10:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000005',
    '60000000-0000-4000-8000-000000000009',
    '30000000-0000-4000-8000-000000000005',
    'Chciałabym spróbować pracy przy aplikacjach mobilnych.',
    'rejected',
    '2026-05-05T15:00:00Z',
    '2026-05-08T09:00:00Z',
    'Wybraliśmy kandydata z większym doświadczeniem mobilnym.'
  ),
  (
    '70000000-0000-4000-8000-000000000006',
    '60000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001',
    'Dodatkowo chcę sprawdzić się w testach jakości i pracy procesowej.',
    'pending',
    '2026-05-06T11:00:00Z',
    null,
    null
  ),
  (
    '70000000-0000-4000-8000-000000000007',
    '60000000-0000-4000-8000-000000000008',
    '30000000-0000-4000-8000-000000000004',
    'Interesuje mnie research i praca blisko użytkowników produktu.',
    'accepted',
    '2026-05-06T16:30:00Z',
    '2026-05-09T10:30:00Z',
    null
  );

insert into public.documents (
  id,
  application_id,
  type,
  file_name,
  storage_path,
  file_size_bytes,
  mime_type,
  uploaded_at,
  review_status,
  reviewed_at,
  supervisor_id,
  rejection_reason
) values
  (
    '80000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000001',
    'contract',
    'student1-contract.pdf',
    '70000000-0000-4000-8000-000000000001/80000000-0000-4000-8000-000000000001_student1-contract.pdf',
    120000,
    'application/pdf',
    '2026-05-09T08:00:00Z',
    'approved',
    '2026-05-10T09:00:00Z',
    '20000000-0000-4000-8000-000000000001',
    null
  ),
  (
    '80000000-0000-4000-8000-000000000002',
    '70000000-0000-4000-8000-000000000001',
    'internship_log',
    'student1-log.pdf',
    '70000000-0000-4000-8000-000000000001/80000000-0000-4000-8000-000000000002_student1-log.pdf',
    180000,
    'application/pdf',
    '2026-05-09T08:15:00Z',
    'approved',
    '2026-05-10T09:05:00Z',
    '20000000-0000-4000-8000-000000000001',
    null
  ),
  (
    '80000000-0000-4000-8000-000000000003',
    '70000000-0000-4000-8000-000000000002',
    'contract',
    'student2-contract.pdf',
    '70000000-0000-4000-8000-000000000002/80000000-0000-4000-8000-000000000003_student2-contract.pdf',
    130000,
    'application/pdf',
    '2026-05-10T10:00:00Z',
    'approved',
    '2026-05-11T10:00:00Z',
    '20000000-0000-4000-8000-000000000001',
    null
  ),
  (
    '80000000-0000-4000-8000-000000000004',
    '70000000-0000-4000-8000-000000000002',
    'internship_log',
    'student2-log.pdf',
    '70000000-0000-4000-8000-000000000002/80000000-0000-4000-8000-000000000004_student2-log.pdf',
    165000,
    'application/pdf',
    '2026-05-10T10:20:00Z',
    'approved',
    '2026-05-11T10:05:00Z',
    '20000000-0000-4000-8000-000000000001',
    null
  ),
  (
    '80000000-0000-4000-8000-000000000005',
    '70000000-0000-4000-8000-000000000003',
    'contract',
    'student3-contract.pdf',
    '70000000-0000-4000-8000-000000000003/80000000-0000-4000-8000-000000000005_student3-contract.pdf',
    150000,
    'application/pdf',
    '2026-05-11T12:00:00Z',
    'approved',
    '2026-05-12T08:30:00Z',
    '20000000-0000-4000-8000-000000000001',
    null
  ),
  (
    '80000000-0000-4000-8000-000000000006',
    '70000000-0000-4000-8000-000000000003',
    'internship_log',
    'student3-log.pdf',
    '70000000-0000-4000-8000-000000000003/80000000-0000-4000-8000-000000000006_student3-log.pdf',
    175000,
    'application/pdf',
    '2026-05-11T12:10:00Z',
    'pending',
    null,
    null,
    null
  ),
  (
    '80000000-0000-4000-8000-000000000007',
    '70000000-0000-4000-8000-000000000007',
    'contract',
    'student4-contract.pdf',
    '70000000-0000-4000-8000-000000000007/80000000-0000-4000-8000-000000000007_student4-contract.pdf',
    142000,
    'application/pdf',
    '2026-05-12T09:00:00Z',
    'approved',
    '2026-05-13T09:00:00Z',
    '20000000-0000-4000-8000-000000000002',
    null
  ),
  (
    '80000000-0000-4000-8000-000000000008',
    '70000000-0000-4000-8000-000000000007',
    'internship_log',
    'student4-log.pdf',
    '70000000-0000-4000-8000-000000000007/80000000-0000-4000-8000-000000000008_student4-log.pdf',
    190000,
    'application/pdf',
    '2026-05-12T09:10:00Z',
    'rejected',
    '2026-05-13T09:05:00Z',
    '20000000-0000-4000-8000-000000000002',
    'Brakuje wymaganych podpisów na dzienniku praktyk.'
  );

insert into public.evaluations (
  id,
  application_id,
  supervisor_profile_id,
  score,
  comment,
  created_at
) values
  (
    '85000000-0000-4000-8000-000000000001',
    '70000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    4,
    'Student dobrze współpracował z zespołem i samodzielnie dowoził zadania.',
    '2026-05-12T14:00:00Z'
  );

update public.profiles
set is_active = false
where id = '30000000-0000-4000-8000-000000000005';

update public.profiles
set is_active = false
where id = '10000000-0000-4000-8000-000000000003';
