# Planning — Sprint 4

**Data:** 2026-05-12  
**Cel sprintu:** Recenzja dokumentów przez opiekuna (F8) — kolejka oczekujących, zatwierdzanie/odrzucanie z powodem; student widzi zaktualizowany status (UC8).

**Powiązane:** [2026-05-10-retro-sprint3.md](2026-05-10-retro-sprint3.md) · [2026-05-15-daily.md](2026-05-15-daily.md)

## Wybrane zadania z backlogu

1. API: `supervisor.documentQueue`, `documents.review`, `documents.getSignedReadUrl`.
2. Rozszerzenie RLS — supervisor: SELECT + UPDATE `review_status` na `documents`.
3. Frontend: `/supervisor/reviews`, `/supervisor/reviews/[applicationId]` — `DocumentPreviewList`, `ReviewActionBar`.
4. Smoke UC8: opiekun recenzuje → student widzi status na swojej aplikacji.

## Ryzyka

- MVP: kolejka wszystkich dokumentów `pending` bez przypisania opiekuna do studenta.
- Podgląd plików — krótkotrwałe signed URLs tylko dla roli supervisor.

## Definition of Done (skrót)

- Opiekun może zatwierdzić lub odrzucić dokument z opcjonalnym powodem; student widzi wynik w UI.
