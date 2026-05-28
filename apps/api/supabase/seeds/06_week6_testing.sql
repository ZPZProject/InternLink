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
--   student3: pending DevOps application (new offer 11) -> tests remote-offer flow
--   student1: accepted Java application (new offer 14, no docs) -> tests many-positions offer
--   student4: pending Marketing application (new offer 12) -> tests non-tech offer flow

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
    '<p><strong>Doświadczenie backendowe z TypeScriptem</strong></p><p>Od dwóch lat pracuję z <strong>Node.js</strong> i <strong>TypeScriptem</strong> przy projektach uczelnianych i własnych. Stworzyłem REST API dla systemu rezerwacji klubów studenckich, który obsługiwał <em>ponad 500 użytkowników</em> w skali miesiąca.</p><p>Najważniejsze projekty:</p><ul><li><strong>KlubManager</strong> – API w Nest.js z Prismą i PostgreSQL</li><li><strong>LogParser</strong> – narzędzie CLI do analizy logów serwerowych napisane w Node.js</li><li><strong>TypeLib</strong> – biblioteka typów dla wewnętrznych API (TypeScript)</li></ul><p>Chciałbym rozwijać się w kierunku <em>architektury backendowej</em> i wierzę, że ten staż będzie do tego świetną okazją.</p>',
    'accepted',
    '2026-05-01T10:00:00Z',
    '2026-05-04T12:00:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    '60000000-0000-4000-8000-000000000003',
    '30000000-0000-4000-8000-000000000002',
    '<p><strong>Frontend z pasją do komponentów</strong></p><p>Specjalizuję się w <strong>React</strong> i <strong>TypeScript</strong>, a ostatnio zgłębiam <em>Next.js</em> oraz systemy projektowe. Uważam, że dobrze zaprojektowany komponent to podstawa każdej solidnej aplikacji.</p><p>W portfolio mam:</p><ul><li>aplikację dashboardową z <strong>dark mode</strong>, wykresami (D3.js) i responsywnym layoutem</li><li>bibliotekę <em>16 komponentów UI</em> na potrzeby koła naukowego</li><li>refaktor legacy kodu React klasowego na funkcyjny z Hooks</li></ul><p>Szukam stażu, gdzie nauczę się <strong>procesu code review</strong> i pracy w zespole produktowym.</p>',
    'accepted',
    '2026-05-02T09:30:00Z',
    '2026-05-05T14:00:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    '60000000-0000-4000-8000-000000000005',
    '30000000-0000-4000-8000-000000000003',
    '<p><strong>Analityk danych w praktycznych projektach</strong></p><p>Po kursie <strong>Data Science</strong> i stypendium naukowym chcę przełożyć teorię na realne biznesowe wyniki. Biegle posługuję się <em>Pythonem</em>, <em>pandas</em> i <em>scikit-learn</em>.</p><p>Zrealizowałem:</p><ol><li><strong>Predykcja cen mieszkań</strong> – model regresji na danych z rynku wtórnego (RMSE: 12k PLN)</li><li><strong>Analiza sentymentu</strong> recenzji produktowych z wykorzystaniem NLP (BERT)</li><li><strong>Dashboard rekrutacyjny</strong> w Streamlit dla biura karier</li></ol><p>Mam nadzieję, że ten staż pozwoli mi rozwinąć skrzydła w <em>data engineering</em> i pracy z dużymi zbiorami danych.</p>',
    'accepted',
    '2026-05-03T08:45:00Z',
    '2026-05-06T11:15:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000004',
    '60000000-0000-4000-8000-000000000007',
    '30000000-0000-4000-8000-000000000004',
    '<p><strong>Full-stack od pomysłu do wdrożenia</strong></p><p>Najbardziej pociąga mnie możliwość pracy nad całym stackiem aplikacji — od bazy danych po interfejs użytkownika. Umiem postawić <strong>API w Node.js</strong> i podpiąć je pod <em>Reactowy frontend</em> w ciągu jednego dnia.</p><blockquote><p>„Full-stack developer to nie ten, który umie wszystko, ale ten, który rozumie całość."</p></blockquote><p>Projekty zaliczeniowe:</p><ul><li><strong>IssueTracker</strong> – pełna aplikacja webowa z auth, rolami i websocketami</li><li><strong>E-Shop prototype</strong> – koszyk, płatności Stripe sandbox, panel admina</li></ul><p>Szukam mentora, który pokaże mi <em>dobre praktyki DevOps</em> i deploymentu.</p>',
    'accepted',
    '2026-05-04T13:20:00Z',
    '2026-05-07T10:10:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000005',
    '60000000-0000-4000-8000-000000000009',
    '30000000-0000-4000-8000-000000000005',
    '<p><strong>Mobile-first: od Fluttera do natywu</strong></p><p>Zaczynałam od <strong>Fluttera</strong> i Darta, a w tym roku weszłam w <em>React Native</em> z Expo. Zbudowałam własną aplikację do śledzenia budżetu domowego.</p><p>Funkcjonalności aplikacji:</p><ul><li>skanowanie paragonów (OCR + Tesseract)</li><li>wykresy wydatków w podziale na kategorie</li><li>export do CSV i synchronizacja przez Firebase</li><li><strong>tryb offline</strong> z kolejką synchronizacji</li></ul><p>Mam nadzieję, że moja znajomość ekosystemu mobilnego będzie wartością dla zespołu.</p>',
    'rejected',
    '2026-05-05T15:00:00Z',
    '2026-05-08T09:00:00Z',
    'Wybraliśmy kandydata z większym doświadczeniem mobilnym.'
  ),
  (
    '70000000-0000-4000-8000-000000000006',
    '60000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000001',
    '<p><strong>Jakość i proces — drugi kierunek rozwoju</strong></p><p>Oprócz backendu interesuję się <strong>testowaniem</strong> i zapewnianiem jakości. Uważam, że dobry developer to ten, który sam testuje swój kod i dba o <em>proces CI/CD</em>.</p><p>Doświadczenie w testach:</p><ul><li>jednostkowe z <strong>Vitest</strong> i <strong>Testing Library</strong></li><li>integracyjne API (Supertest + testcontainers)</li><li>podstawy <em>Playwright</em> do E2E</li></ul><p>Chciałbym poznać, jak wygląda <strong>code review</strong> i pipeline jakości w komercyjnym zespole.</p>',
    'pending',
    '2026-05-06T11:00:00Z',
    null,
    null
  ),
  (
    '70000000-0000-4000-8000-000000000007',
    '60000000-0000-4000-8000-000000000008',
    '30000000-0000-4000-8000-000000000004',
    '<p><strong>Research i praca blisko użytkownika</strong></p><p>W projektach łączę <strong>analizę danych</strong> z <em>badaniem potrzeb użytkowników</em>. Przeprowadziłam wywiady z 20 studentami podczas projektu badawczego na potrzeby redesignu systemu rekrutacyjnego uczelni.</p><p>Metodyki, które znam:</p><ul><li>ankiety i analiza statystyczna (Google Forms + Python)</li><li>testy A/B i analiza zachowań (Hotjar, GA4)</li><li>persony i mapy podróży użytkownika</li></ul><p>Mam nadzieję, że ten staż pozwoli mi rozwijać się w kierunku <strong>Product Research</strong> i UX analytics.</p>',
    'accepted',
    '2026-05-06T16:30:00Z',
    '2026-05-09T10:30:00Z',
    null
  );

-- Additional applications for the 5 new internship offers (11–15).
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
    '70000000-0000-4000-8000-000000000008',
    '60000000-0000-4000-8000-000000000011',
    '30000000-0000-4000-8000-000000000003',
    '<p><strong>DevOps i AWS — naturalny krok po data science</strong></p><p>Po kursie data science odkryłem, że najwięcej radości daje mi <strong>automatyzacja</strong> i <strong>infrastruktura</strong>. Umiem postawić VPS z Dockerem i skonfigurować Github Actions.</p><p>Znajomość narzędzi:</p><ul><li><strong>Docker</strong> + docker-compose (własne obrazy, multi-stage build)</li><li><strong>AWS</strong> (EC2, S3, IAM — na poziomie praktyk)</li><li><strong>CI/CD</strong> (Github Actions, podstawy Terraforma)</li></ul><p>Praktyka zdalna z DevOps to dokladnie to, czego szukam — chcę przejść od używania Docker Desktop do <em>produkcyjnych clusterów</em>.</p>',
    'pending',
    '2026-06-01T09:00:00Z',
    null,
    null
  ),
  (
    '70000000-0000-4000-8000-000000000009',
    '60000000-0000-4000-8000-000000000014',
    '30000000-0000-4000-8000-000000000001',
    '<p><strong>Ekosystem Java — nowy horyzont</strong></p><p>Choć zawodowo piszę w <strong>Node.js</strong>, od kilku miesięcy systematycznie uczę się <em>Javy i Spring Boota</em>. Uważam, że znajomość różnych ekosystemów czyni developera bardziej wszechstronnym.</p><p>Postępy w nauce:</p><ol><li>ukończyłem kurs <strong>Spring Boot 3</strong> na Udemy</li><li>napisałem prosty CRUD z JPA i PostgreSQL</li><li>poznaję <em>testy integracyjne</em> z Testcontainers</li></ol><p>Staż w Javie pozwoli mi poszerzyć horyzonty i sprawdzić się w <strong>warstwie enterprise</strong>, której w Node.js brakuje.</p>',
    'accepted',
    '2026-06-02T10:30:00Z',
    '2026-06-05T12:00:00Z',
    null
  ),
  (
    '70000000-0000-4000-8000-000000000010',
    '60000000-0000-4000-8000-000000000012',
    '30000000-0000-4000-8000-000000000004',
    '<p><strong>Marketing technologiczny — moja nisza</strong></p><p>Łączę umiejętności <strong>techniczne</strong> z <em>kreatywnością marketingową</em> — potrafię napisać skrypt do scrapowania trendów i zaprojektować kampanię na jego podstawie.</p><p>Projekty łączące tech z marketingiem:</p><ul><li>skrypt do analizy <strong>Google Trends</strong> i generowania raportów PDF</li><li>dashboard SEO w <strong>React + Chart.js</strong> (pozycje, backlinks, ruch)</li><li>automatyzacja <em>Mailchimp API</em> dla kampanii e-mailowych koła naukowego</li></ul><p>Wierzę, że marketing przyszłości opiera się na danych, a ja mam kompetencje, by dostarczać te dane i wyciągać z nich wnioski.</p>',
    'pending',
    '2026-06-03T14:15:00Z',
    null,
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
