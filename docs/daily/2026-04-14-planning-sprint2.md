# Planning — Sprint 2

**Data:** 2026-04-14  
**Cel sprintu:** Model firmy i ofert stażowych oraz widoki listy/szczegółów i panel pracodawcy — tak, aby studenci widzieli realne oferty, a pracodawca mógł je tworzyć i edytować.

## Wybrane zadania z backlogu

1. Migracja `20260406130000_week2_companies_offers.sql`: `companies`, `company_members`, `internship_offers` + RLS.
2. Migracja `20260409103000_student_profiles_applications.sql`: `student_profiles`, tabela `applications` (MVP), statusy.
3. Router `offers` (tRPC): lista publiczna, szczegóły, CRUD dla pracodawcy.
4. Frontend: `/offers`, `/offers/[id]`, `/employer/offers` + formularz oferty.
5. Onboarding / dane studenta tam, gdzie wymaga tego ścieżka aplikacji.

## Ryzyka

- Spójność RLS przy zagnieżdżonych selectach (oferta → firma → członkostwo).
- Terminy aplikacji i pola wymagane w formularzu — walidacja UI + Zod.
