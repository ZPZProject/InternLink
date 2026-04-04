# Plan implementacji InternLink — 2 osoby (frontend + backend), **7 tygodni**

Dokument opiera się na [karcie projektu](karta-projektu.md) i [specyfikacji](specyfikacja-praktyki.md). Harmonogram jest **skrócony względem 10 tygodni z karty** — etapy analityczne, projektowe i implementacyjne są **scalone**; praca dokumentacyjna i testowa wpisana jest równolegle do sprintów oraz w tydzień końcowy.

**Stack (repozytorium):** Next.js (App Router), tRPC, Supabase (PostgreSQL, Auth, Storage), monorepo (`apps/app`, `packages/api`, `packages/supabase`, `packages/ui`).

**Role:**  
- **Frontend (FE)** — UI, routing, formularze, responsywność, integracja z API (tRPC/React Query).  
- **Backend (BE)** — schemat bazy, migracje SQL, RLS, procedury tRPC, walidacja (Zod), Storage.

**Współpraca co tydzień:** daily/async; jedna synchronizacja kontraktu API; GitHub Projects; Definition of Done dla sprintu.

---

## Konwencje strukturalne (repozytorium)

| Warstwa | Lokalizacja (propozycja) | Uwagi |
|---------|---------------------------|--------|
| Migracje / SQL | `apps/api/supabase/migrations` lub `packages/supabase/migrations` (zgodnie z ustaleniem zespołu) | Jedno źródło prawdy dla schematu. |
| Typy DB | `packages/supabase/src/types/db.ts` (generowane z `supabase gen types`) | Po każdej migracji — regeneracja typów. |
| Routery tRPC | `packages/api/src/router/*.ts`, agregacja w `root.ts` | Procedury `publicProcedure` / `protectedProcedure` + middleware roli. |
| Klient tRPC w Next | `apps/app/src/trpc/*` | Provider + server caller dla RSC. |
| Strony | `apps/app/src/app/...` | Grupy tras: `(auth)`, `(dashboard)` z layoutami per rola lub wspólny layout + guard. |
| Komponenty domenowe | `apps/app/src/features/<domena>/components/*` | Logika UI blisko featurowi; paski, formularze, tabele. |
| Design system | `packages/ui` | Przyciski, inputy, dialogi, tabela (np. TanStack Table w kompozycji), toast (`sonner`). |
| Walidacja współdzielona | `packages/api/src/schemas/*` lub `packages/validators` | Te same Zod schematy w inputach tRPC (opcjonalnie eksport do FE dla `defaultValues`). |

Nazewnictwo tabel w DB: **`snake_case`**, liczba mnoga (`profiles`, `internship_offers`). Klucze główne: **`uuid`** (`gen_random_uuid()`).

---

## Model docelowy (skrót ER — rozwijany tygodniami)

```
auth.users (Supabase)
    └── profiles (1:1) — role, is_active, imię/nazwisko, email snapshot
    └── student_profiles | employer_profiles | supervisor_profiles (1:1 wg roli, rozszerzenia)

employer_profiles ──< internship_offers
internship_offers ──< applications >── student_profiles
applications ──< documents
applications ──< evaluations (max 1 na aplikację w MVP)
```

---

## Zakres funkcjonalny (ta iteracja)

**W zakresie:** F1–F8, F10, F9.

**Poza zakresem:** F11–F14 (jak wcześniej — konfiguracja, e-mail, raporty eksportowe); F15–F16 Won’t.

---

## Tydzień 1 — Start, środowisko, auth

### Baza danych / Supabase Auth

| Element | Szczegóły |
|---------|-----------|
| **Rozszerzenia** | `uuid-ossp` lub wbudowane `gen_random_uuid()`. |
| **Enum** | `user_role`: `student`, `employer`, `supervisor`, `admin`. |
| **Tabela `profiles`** | `id` UUID PK, `user_id` UUID UNIQUE NOT NULL REFERENCES `auth.users(id)` ON DELETE CASCADE, `email` TEXT, `first_name`, `last_name`, `role` `user_role` NOT NULL, `is_active` BOOLEAN DEFAULT true, `created_at`, `updated_at`. |
| **Trigger** | `on_auth_user_created` → INSERT do `profiles` (domyślna rola ustalona z metadanych sign-up lub tymczasowo `student` + zmiana przez admina później). |
| **RLS `profiles`** | Użytkownik: SELECT/UPDATE **tylko** własnego wiersza po `user_id = auth.uid()`. Admin: pełny dostęp (polityka `role = admin` — funkcja `auth.jwt()` lub join do `profiles` w subquery). |

### API (tRPC)

| Router / procedura | Opis |
|--------------------|------|
| `auth.getSession` lub wykorzystanie sesji Supabase po stronie Next | Zwraca użytkownika + `profile` (rola, `is_active`). |
| `profile.me` | `protectedProcedure` — dane profilu zalogowanego. |
| `profile.updateMe` | Opcjonalnie w t1: tylko imię/nazwisko (bez zmiany roli). |

Middleware: jeśli `!profile.is_active` → błąd `FORBIDDEN`.

### Frontend — trasy i komponenty

| Element | Szczegóły |
|---------|-----------|
| **Trasy** | `/login`, `/register` (lub jedna strona z tabem); `/(dashboard)/home` — strona chroniona. |
| **Layout** | `app/(auth)/layout.tsx` — minimalistyczny; `app/(dashboard)/layout.tsx` — sidebar lub top nav z **menu zależnym od `profile.role`** (placeholdery linków). |
| **Komponenty** | `features/auth/LoginForm.tsx`, `RegisterForm.tsx` (react-hook-form + Zod); `components/RoleBadge.tsx`; `features/shell/AppShell.tsx` (nav). |
| **Guard** | HOC lub layout server component: brak sesji → redirect na `/login`; opcjonalnie `withRole(['employer'])` od tygodnia 2. |
| **Stany** | Loading skeleton na layout; toast przy błędzie logowania (`sonner`). |

### Success measure

Rejestracja + logowanie E2E; `profiles.role` widoczne w `profile.me`; build `turbo dev` działa; migracja SQL w repozytorium.

---

## Tydzień 2 — Oferty (**F1**, **F5**)

### Baza danych

| Tabela / typ | Kolumny (minimalny zestaw) |
|--------------|----------------------------|
| **`employer_profiles`** | `id` PK, `profile_id` UNIQUE FK → `profiles`, `company_name` TEXT NOT NULL, `tax_id` TEXT NULL, `address` TEXT NULL, `contact_person` TEXT NULL, `is_verified` BOOLEAN DEFAULT false, `created_at`. |
| **`internship_offers`** | `id` PK, `employer_profile_id` FK → `employer_profiles`, `title`, `description`, `requirements`, `location`, `number_of_positions` INT, `start_date`, `end_date` DATE, `is_active` BOOLEAN DEFAULT true, `created_at`, `updated_at`, opcjonalnie `application_deadline` lub wyliczane `closes_at` (60 dni — reguła w aplikacji). |
| **Indeksy** | `(is_active, created_at DESC)`, `(employer_profile_id)`, `(location)` — pod filtry. |

**RLS `internship_offers`**

- **SELECT:** wszyscy zalogowani widzą wiersze z `is_active = true` (studenci/opiekunowie/admin); właściciel (employer przez join `employer_profiles.profile_id` = jego `profiles.id`) widzi także swoje nieaktywne.
- **INSERT/UPDATE/DELETE:** tylko employer będący właścicielem rekordu; **INSERT pierwszej oferty** wymaga `employer_profiles.is_verified = true` (enforce w tRPC + CHECK triggerem opcjonalnie).

**Tabela `applications` (szkielet na tydzień 3)** — można dodać pustą strukturę już w t2 dla FK:

| Kolumna | Typ |
|---------|-----|
| `id` | UUID PK |
| `offer_id` | FK → `internship_offers` |
| `student_profile_id` | FK → `student_profiles` (tabela poniżej) |
| `status` | enum: na razie wartości minimalne lub placeholder |

**`student_profiles`:** `id`, `profile_id` UNIQUE FK → `profiles`, `index_number`, `major`, `year_of_study` — wymagane do relacji `applications` w t3; można wypełnić triggerem przy roli `student` lub ręcznie w seed.

### API (tRPC)

| Procedura | Wejście / wyjście (skrót) |
|-----------|---------------------------|
| `offers.list` | Query: `filters` (location, isActive, search), `cursor`/`page`; zwraca listę + total. |
| `offers.byId` | `id` — szczegóły oferty (404 jeśli student a oferta nieaktywna). |
| `offers.create` | Employer only; body Zod; **403 jeśli !is_verified i brak wcześniejszych ofert** (lub zawsze wymagaj weryfikacji przed pierwszą — jak w spec). |
| `offers.update` | Employer only; właściciel oferty. |
| `offers.setActive` | Przełączenie `is_active` (zamiast delete). |

### Frontend

| Trasa / komponent | Opis |
|-------------------|------|
| `/offers` | `features/offers/OfferListPage.tsx` — `OfferFilters` (nuqs lub lokalny state), `OfferCard` lub wiersz tabeli, `EmptyOffersState`. |
| `/offers/[id]` | `OfferDetailPage.tsx` — treść oferty; przycisk „Aplikuj” **disabled** lub ukryty do tygodnia 3. |
| `/employer/offers` | Lista własnych ofert; `OfferForm.tsx` (create/edit) — react-hook-form; `DeleteConfirmDialog` / deaktywacja. |
| **Komponenty współdzielone** | `DataTable` wrapper w `packages/ui` lub lokalnie; `Pagination`; `FormField` z `@v1/ui`. |

### Success measure

Student widzi tylko aktywne cudze oferty; firma CRUD na swoich; pierwsza oferta zablokowana dla niezweryfikowanej firmy; diagram ER zaktualizowany w `docs/`.

---

## Tydzień 3 — Aplikacje (**F2**, **F4**, **F6**, **F7**)

### Baza danych

| Element | Szczegóły |
|---------|-----------|
| **Enum `application_status`** | Np. `pending`, `accepted`, `rejected`, `withdrawn` (opcjonalnie). „Aktywne” dla limitu 5: status IN (`pending`) lub ewentualnie `pending`+`accepted` — **uzgodnijcie:** limit 5 dotyczy zwykle oczekujących; spec: „max 5 aplikacji jednocześnie” → policz `pending` + ewentualnie `accepted` przed zakończeniem praktyki. MVP: licz `WHERE status = 'pending' OR status = 'accepted'`. |
| **`applications`** (pełne) | Unikalny constraint `(offer_id, student_profile_id)`; `motivation_letter` TEXT; `cv_storage_path` TEXT NULL (jeśli CV dopiero w Storage w t4 — można TEXT URL zewnętrzny lub pole na ścieżkę w t4); `applied_at`, `reviewed_at` NULL, `employer_rejection_reason` TEXT NULL. |
| **RLS** | **Student:** SELECT/INSERT własne; **Employer:** SELECT/UPDATE (tylko status/reason) dla aplikacji na **swoich** ofertach (join `internship_offers.employer_profile_id`). **Supervisor/Admin:** SELECT wg potrzeb (np. admin all). |

**Funkcja SQL (opcjonalnie)** `count_active_applications(student_profile_id)` dla limitu 5 — wywołanie w tRPC przed INSERT.

### API (tRPC)

| Procedura | Opis |
|-----------|------|
| `applications.apply` | Student; walidacja limitu 5, duplikatu, oferta `is_active`, deadline. |
| `applications.myList` | Student — lista z joinem do oferty (tytuł, firma). |
| `applications.byOffer` | Employer — lista aplikacji dla `offerId`. |
| `applications.review` | Employer — `accept` / `reject` + opcjonalny powód. |

### Frontend

| Trasa / komponent | Opis |
|-------------------|------|
| `/offers/[id]` | Aktywny `ApplyButton` → dialog `ApplicationForm` (motywacja, CV pole na razie URL lub file w t4). |
| `/student/applications` | `ApplicationList.tsx`, `ApplicationStatusBadge.tsx`, link do oferty. |
| `/employer/offers/[id]/applications` | Tabela aplikacji: `StudentSummaryCell`, akcje `AcceptRejectActions.tsx`. |
| **Komponenty** | `StatusBadge` mapujący enum; empty states. |

### Success measure

UC2 w pełni; przekroczenie limitu; duplikat; firma akceptuje/odrzuca; student widzi status w czasie rzeczywistym (refetch po mutacji).

---

## Tydzień 4 — Dokumenty (**F3**)

### Storage (Supabase)

| Element | Szczegóły |
|---------|-----------|
| **Bucket** | `application-documents` (private). |
| **Ścieżka pliku** | `{application_id}/{document_id}_{slug(file_name)}` — ułatwia RLS po `application_id`. |
| **MIME / rozmiar** | Walidacja po stronie upload (signed URL flow) i w tRPC przy zapisie metadanych. |

### Baza danych

| Tabela | Kolumny |
|--------|---------|
| **`documents`** | `id` PK, `application_id` FK, `type` ENUM (`contract`, `internship_log`, `other`), `file_name`, `storage_path`, `file_size_bytes`, `mime_type`, `uploaded_at`, `review_status` ENUM (`pending`, `approved`, `rejected`), `reviewed_at`, `supervisor_id` FK NULL (profile opiekuna), `rejection_reason` TEXT NULL. |

**RLS**

- **Student:** INSERT/SELECT na dokumentach swoich aplikacji; tylko gdy `applications.status = 'accepted'` (warunek UC3).
- **Employer:** opcjonalnie SELECT metadanych (do ustalenia); MVP często tylko student + supervisor.
- **Supervisor:** SELECT + UPDATE `review_status` (tydzień 5).
- **Policy Storage:** read/upload przez Supabase Storage policies powiązane z `storage.objects` i ownership (lub signed URLs generowane w tRPC dla studenta/opiekuna).

### API (tRPC)

| Procedura | Opis |
|-----------|------|
| `documents.getUploadUrl` lub `createUploadIntent` | Zwraca signed URL + tworzy wiersz `documents` w stanie draft / lub finalize po uploadzie. |
| `documents.listByApplication` | Student / supervisor / employer wg RLS. |
| `documents.delete` | Tylko student, tylko `review_status = pending` (opcjonalnie). |

### Frontend

| Trasa / komponent | Opis |
|-------------------|------|
| `/student/applications/[id]` | `DocumentUploadZone.tsx` (drag-drop, limit 10 MB, typy plików), `DocumentList.tsx` z ikoną typu i statusem. |
| **Komponenty** | `FileTypeIcon`, `UploadProgress`, komunikaty błędów walidacji (klient + serwer). |

### Success measure

Upload po zaakceptowanej aplikacji; odrzucenie złego typu/rozmiaru; lista dokumentów spójna z DB.

---

## Tydzień 5 — Opiekun — dokumenty (**F8**)

### Baza / logika

| Element | Szczegóły |
|---------|-----------|
| **Reguły** | Procedura `documents.review` (supervisor): ustawia `approved`/`rejected` + `rejection_reason`; `supervisor_id` = aktualny profil. |
| **Widoczność** | Kolejka: aplikacje z dokumentami `review_status = pending` — zapytanie z joinami (student, oferta, lista dokumentów). Opcja MVP: wszyscy studenci z `pending` dokumentami (bez przypisania opiekuna do studenta); rozszerzenie: `student_profiles.supervisor_profile_id`. |
| **Przygotowanie pod F9** | Tabela `evaluations` może być utworzona pusta lub z constraint: jedna ocena na `application_id`. |

### API (tRPC)

| Procedura | Opis |
|-----------|------|
| `supervisor.documentQueue` | Lista pozycji: student, aplikacja, oferta, zbiór dokumentów + statusy. |
| `documents.review` | Batch lub pojedynczo dokument; supervisor only. |
| `documents.getSignedReadUrl` | Podgląd pliku dla opiekuna (krótkotrwały URL). |

### Frontend

| Trasa / komponent | Opis |
|-------------------|------|
| `/supervisor/reviews` | `DocumentReviewQueue.tsx` — tabela lub karty. |
| `/supervisor/reviews/[applicationId]` | `DocumentPreviewList.tsx` (link „pobierz/podgląd”), `ReviewActionBar.tsx` (zatwierdź / odrzuć + textarea powodu). |

### Success measure

UC8; student widzi zaktualizowany status dokumentu na swojej aplikacji.

---

## Tydzień 6 — Ocena (**F9**) + Admin (**F10**)

### Baza danych

| Tabela | Kolumny |
|--------|---------|
| **`evaluations`** | `id` PK, `application_id` UNIQUE FK, `supervisor_profile_id` FK, `score` SMALLINT CHECK (score BETWEEN 2 AND 5), `comment` TEXT, `created_at`. |
| **`audit_logs`** (minimalny MVP) | `id`, `actor_profile_id`, `action` TEXT, `entity_type`, `entity_id` UUID, `metadata` JSONB, `created_at`. |

**Constraint logiki F9:** INSERT do `evaluations` tylko jeśli wszystkie wymagane dokumenty dla aplikacji mają `review_status = approved` (trigger lub wyłącznie w tRPC z transakcją).

**RLS admin**

- Tylko rola `admin` może SELECT/UPDATE `profiles` (cudze) dla `is_active`, `role`.
- Zwykły użytkownik nie zmienia `role` przez `profile.updateMe`.

### API (tRPC)

| Procedura | Opis |
|-----------|------|
| `evaluations.listCompletable` | Supervisor — aplikacje spełniające warunek dokumentów. |
| `evaluations.create` | Supervisor — ocena + komentarz; blokada jeśli już istnieje. |
| `evaluations.byApplication` | Student — podgląd własnej oceny. |
| `admin.users.list` | Paginacja, filtry `role`, `is_active`, wyszukiwanie po email. |
| `admin.users.setActive` | `is_active` toggle. |
| `admin.users.setRole` | Zmiana roli + wpis do `audit_logs`. |

### Frontend

| Trasa / komponent | Opis |
|-------------------|------|
| `/supervisor/evaluations` | Lista aplikacji do oceny; `EvaluationForm.tsx` (slider/select 2–5, komentarz). |
| `/student/applications/[id]` | Sekcja „Ocena” (read-only po zapisie). |
| `/admin/users` | `UserAdminTable.tsx` (TanStack Table), `RoleSelect`, `ConfirmDangerDialog` przy zmianie roli; badge „nieaktywny”. |

### Success measure

UC9 + UC11; próba oceny przed akceptacją dokumentów → błąd; audit przy zmianie roli.

---

## Tydzień 7 — Stabilizacja, testy, dokumentacja, prezentacja

### Backend

- Przegląd wszystkich polityk RLS na ścieżce krytycznej (skrypt checklist w `docs/`).
- Seed SQL lub `bun` script: 1 admin, 2 firmy (jedna zweryfikowana), studenci, oferty, aplikacje w różnych statusach, dokumenty, ocena przykładowa.
- `README` w `packages/api` lub root: jak uruchomić migracje + env.

### Frontend

- Responsywność breakpointów na kluczowych widokach (lista ofert, tabele employer/admin).
- Focus visible, etykiety pól formularzy (NF19 uproszczone).
- Opcjonalnie nagranie demo (2–3 min).

### Dokumentacja zespołowa

- Raport testów (tabela: UC / wynik / uwagi).
- UML zsynchronizowany z faktycznymi tabelami.
- Protokół odbioru + slajdy.
- Sekcja „Backlog” (F11–F14).

### Success measure

Brak krytycznych regresji na flow końcowym; materiały zaliczeniowe kompletne.

---

## Mapowanie wymagań → tydzień

| Wymaganie | Tydzień |
|-----------|---------|
| F1, F5 | 2 |
| F2, F4, F6, F7 | 3 |
| F3 | 4 |
| F8 | 5 |
| F9, F10 | 6 |
| — | 7 |
| F11–F14 | poza zakresem |

---

## Globalne kryteria sukcesu

- Pełny cykl biznesowy z karty + **F10** i **F9**.
- RBAC na poziomie RLS + procedur tRPC (podwójna warstwa).
- Retrospektywy po tygodniach **3** i **6**.

---

*Wersja planu: 2.1 — 7 tygodni, szczegóły DB / API / FE.*
