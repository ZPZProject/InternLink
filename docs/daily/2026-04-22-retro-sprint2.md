# Retrospektywa — Sprint 2

**Data:** 2026-04-22 (po domknięciu aplikacji)  
**Cel:** Poprawa procesu i współpracy w następnym cyklu (nie ocena samego produktu).

**Powiązane:** [2026-04-20-daily.md](2026-04-20-daily.md) · [2026-04-23-planning-sprint3.md](2026-04-23-planning-sprint3.md)

---

## Co poszło dobrze

- Domknięcie ofert i aplikacji w jednym cyklu — studenci i pracodawcy mają pełną ścieżkę MVP.
- Wspólny seed ułatwia ręczne testy E2E bez ręcznego zakładania kont.

## Co poszło słabiej / bóle

- Polityki RLS wymagały dodatkowej iteracji (JWT zamiast subquery do `profiles`).
- Duże PR-y utrudniały review i szybkie wychwycenie regresji.

## Action items (konkretne na Sprint 3)

| # | Działanie | Właściciel (rola) | Status |
| --- | --- | --- | --- |
| 1 | Mniejsze PR-y — rozdzielenie DB / API / UI | Zespół | Do zrobienia |
| 2 | Checklista smoke po każdej migracji (student / employer / supervisor) | Zespół | W toku |
| 3 | Regularne, krótkie wpisy Daily w `docs/daily/` | Wszyscy | W toku |
