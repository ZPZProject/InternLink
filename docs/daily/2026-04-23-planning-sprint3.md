# Planning — Sprint 3

**Data:** 2026-04-23  
**Cel sprintu:** Upload i metadane dokumentów aplikacji (F3) — student wgrywa pliki po zaakceptowanej aplikacji; lista dokumentów spójna z bazą i Storage.

**Powiązane:** [2026-04-22-retro-sprint2.md](2026-04-22-retro-sprint2.md) · [2026-04-25-daily.md](2026-04-25-daily.md)

## Wybrane zadania z backlogu

1. Migracja: tabela `documents`, enumy (`document_type`, `document_review_status`), RLS, prywatny bucket `application-documents`.
2. API (tRPC): router `documents` — `createUploadIntent`, `listByApplication`, `delete`; service-role client pod signed URLs.
3. Frontend: `/student/applications/[id]` — `DocumentUploadZone`, `DocumentList`.
4. Smoke UC3: upload tylko gdy `applications.status = 'accepted'`; odrzucenie złego typu lub rozmiaru pliku.

## Ryzyka

- Spójność polityk RLS w PostgreSQL i Supabase Storage.
- Walidacja MIME / rozmiaru (max 10 MB) po stronie klienta i serwera.

## Definition of Done (skrót)

- Student wgrywa dokument po akceptacji aplikacji; metadane w DB odpowiadają plikowi w bucketcie.
