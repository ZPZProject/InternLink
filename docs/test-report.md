# Test Report

Manual verification report for the implemented InternLink scope.

## Environment

| Item | Value |
|------|-------|
| App | InternLink local development |
| Database | Local Supabase via `bun run db:reset` |
| Seed set | `apps/api/supabase/seeds/01_auth_users.sql` to `06_week6_testing.sql` |
| Accounts | Seeded admin, supervisor, employer, and student users |

## Results

| Requirement | Scenario | Expected result | Result | Notes |
|------------|----------|-----------------|--------|-------|
| F1 | Student browses active offers | Active offers visible | Pass | `/offers` |
| F2 | Student applies to offer | Application created with validation | Pass | Limit and duplicate checks implemented |
| F3 | Student uploads allowed document to accepted application | Upload succeeds and appears in list | Pass | PDF and DOCX only |
| F4 | Student sees own application list and statuses | Only own applications visible | Pass | `/student/applications` |
| F5 | Employer manages own offers | CRUD-like flow on own offers only | Pass | Activation/deactivation used instead of delete |
| F6 | Employer reviews application | Accept or reject updates status | Pass | Employer ownership enforced |
| F7 | Student sees updated application state | Refetch reflects status changes | Pass | Manual refetch/invalidation used |
| F8 | Supervisor reviews documents | Approve or reject pending documents | Pass | `/supervisor/reviews` |
| F9 | Supervisor creates evaluation after document approval | Evaluation allowed only when rules are met | Pass | `/supervisor/evaluations` |
| F9 | Student sees own evaluation | Read-only evaluation visible on application detail | Pass | `/student/applications/[id]` |
| F10 | Admin lists users and filters by role/status | Filtering and search work | Pass | `/admin/users` |
| F10 | Admin toggles `is_active` | User activation state changes | Pass | Audit log row written |
| F10 | Admin changes user role | Not implemented by current product decision | Deferred | Explicitly postponed |

## Deferred Items

| Item | Status | Reason |
|------|--------|--------|
| `admin.users.setRole` | Deferred | Current product decision excludes role changes for now |

## Known Issues

| Item | Status |
|------|--------|
| Protected route hydration/auth regressions | Monitor with RLS smoke checklist |
| Global app typecheck blocker from duplicate icon keys | Fixed in current stabilization batch |
