# RLS Smoke Checklist

Use this checklist after major auth, RLS, or protected tRPC changes.

## Setup

1. Run `bun run db:reset`
2. Start the app with `bun run dev:app`
3. Use the seeded accounts from `README.md`

## Unauthenticated

| Check | Expected result |
|------|-----------------|
| Open `/home` | Redirect to `/login` |
| Open `/student/applications` | Redirect to `/login` |
| Open `/supervisor/reviews` | Redirect to `/login` |
| Open `/supervisor/evaluations` | Redirect to `/login` |
| Open `/admin/users` | Redirect to `/login` |

## Student

Use `student1@seed.internlink.local` unless another user is named.

| Check | Expected result |
|------|-----------------|
| Open `/offers` | Visible |
| Open `/student/applications` | Only own applications visible |
| Open another student's application detail URL directly | Not found or forbidden |
| Open accepted own application detail | Documents panel visible |
| Open rejected own application detail | No document upload allowed |
| Open `/supervisor/reviews` | Redirect away |
| Open `/supervisor/evaluations` | Redirect away |
| Open `/admin/users` | Redirect away |
| For `student2`, open evaluated application detail | Evaluation section visible |

## Employer

Use `employer1@seed.internlink.local` unless another employer is named.

| Check | Expected result |
|------|-----------------|
| Open `/employer/offers` | Only own offers visible |
| Open `/employer/offers/[id]/applications` for own offer | Visible |
| Open another employer's offer applications URL directly | Not found or forbidden |
| Open `/supervisor/reviews` | Redirect away |
| Open `/supervisor/evaluations` | Redirect away |
| Open `/admin/users` | Redirect away |

## Supervisor

Use `supervisor1@seed.internlink.local`.

| Check | Expected result |
|------|-----------------|
| Open `/supervisor/reviews` | Pending-review queue visible |
| Open review details for accepted application with pending document | Documents visible |
| Approve or reject a pending document | Status updates and queue refreshes |
| Open `/supervisor/evaluations` | Only completable applications visible |
| `student1` appears in evaluations | Yes |
| `student2` appears in evaluations | No, already evaluated |
| `student3` appears in evaluations | No, pending document |
| `student4` appears in evaluations | No, rejected or missing documents |
| Open `/admin/users` | Redirect away |

## Admin

Use `admin1@seed.internlink.local`.

| Check | Expected result |
|------|-----------------|
| Open `/admin/users` | Visible |
| Search by email or name | Results filter correctly |
| Filter by role | Results filter correctly |
| Filter by status | Results filter correctly |
| Reactivate `student5` | Success |
| Deactivate `employer3` or another active user | Success |
| Try to deactivate own admin account | Blocked with error |
| Open supervisor-only route | Redirect away unless route is also admin-allowed by product rules |

## Data Isolation

| Check | Expected result |
|------|-----------------|
| Student cannot query or view another student's evaluation | Forbidden or no data |
| Employer cannot access evaluation data | Forbidden |
| Supervisor can evaluate only accepted applications with all documents approved | Enforced |
| Admin can toggle `is_active` for other users | Enforced |

## Regression Notes

- Watch for `401 UNAUTHORIZED` on protected tRPC routes.
- Watch for hydration mismatch warnings in the console.
- If a protected page renders but later refetches fail, check page-level prefetch and hydration boundaries.
