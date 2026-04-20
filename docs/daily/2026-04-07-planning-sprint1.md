# Planning — Sprint 1

**Data:** 2026-04-07  
**Cel sprintu:** Działające logowanie, profil użytkownika z rolami oraz bezpieczny dostęp do danych (RLS), żeby można było iterować nad ofertami i aplikacjami w kolejnych sprintach.

## Wybrane zadania z backlogu (deklaracja zespołu)

1. Inicjalizacja monorepo (Next.js, tRPC, Supabase, pakiety współdzielone).
2. Model `profiles` + trigger profilu + enum ról.
3. UI: auth + szkielet dashboardu (`AppShell`), guard sesji.
4. Router tRPC: sesja, odczyt/aktualizacja profilu, middleware aktywności konta.
5. Konwencje PR / env / branching udokumentowane w repo.

## Ryzyka / założenia

- Dostęp do projektu Supabase i spójne `.env` dla całego zespołu.
- RLS wymaga spójnych claimów JWT (role) — do weryfikacji na stagingu.

## Definition of Done (skrót)

- Build przechodzi lokalnie; krytyczne ścieżki (rejestracja, login, edycja profilu) przetestowane ręcznie.
