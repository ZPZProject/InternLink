# Retrospektywa — Sprint 1

**Data:** 2026-04-11 (po podsumowaniu przyrostu)  
**Cel:** Poprawa procesu i współpracy w następnym cyklu (nie ocena samego produktu).

---

## Co poszło dobrze

- Szybkie domknięcie „szkieletu” auth + profilu umożliwia start prac nad danymi domenowymi.
- Jasny podział pakietów (`packages/api`, `packages/supabase`) ułatwia współdzielenie typów i polityk.

## Co poszło słabiej / bóle

- RLS i JWT wymagały dodatkowego czasu na doprecyzowanie (admin vs właściciel rekordu).
- Koordynacja zmiennych środowiskowych między `apps/app` a `apps/api`.

## Action items (konkretne na Sprint 2)

| # | Działanie | Właściciel (rola) | Status |
| --- | --- | --- | --- |
| 1 | Krótka „ściąga” env w README lub wewn. wiki zespołu | Tech lead | Do zrobienia |
| 2 | Po każdym większym kroku RLS — checklista smoke (student / employer) | Zespół | W toku |
| 3 | Utrzymywać codzienne, krótkie wpisy Daily w `docs/daily/` | Wszyscy | W toku |
