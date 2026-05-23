# Retrospektywa — Sprint 3

**Data:** 2026-05-10 (po smoke F3)  
**Cel:** Poprawa procesu i współpracy w następnym cyklu (nie ocena samego produktu).

**Powiązane:** [2026-05-08-daily.md](2026-05-08-daily.md) · [2026-05-12-planning-sprint4.md](2026-05-12-planning-sprint4.md)

---

## Co poszło dobrze

- Pełna ścieżka uploadu — od signed URL po metadane w `documents`.
- Spójność rekordów DB z plikami w Storage po finalize uploadu.

## Co poszło słabiej / bóle

- Polityki Storage wymagały dodatkowego debugowania obok RLS w PostgreSQL.
- Dłuższa przerwa między wpisami Daily w repo.

## Action items (konkretne na Sprint 4)

| # | Działanie | Właściciel (rola) | Status |
| --- | --- | --- | --- |
| 1 | Wcześniejszy smoke Storage na wspólnym stagingu | Zespół | Do zrobienia |
| 2 | Krótsze cykle Daily w `docs/daily/` (co ~1 tydzień) | Wszyscy | W toku |
| 3 | Rozdzielić PR-y: migracja / API / UI | Zespół | Do zrobienia |
