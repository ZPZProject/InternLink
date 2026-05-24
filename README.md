# InternLink

InternLink is a university internship platform built with Next.js, tRPC, Supabase, and a shared UI package in a Bun monorepo.

## Stack

- Next.js App Router in `apps/app`
- tRPC API in `packages/api`
- Supabase for Auth, Postgres, and Storage in `apps/api`
- shared UI components in `packages/ui`

## Repository Layout

```text
.
├── apps/
│   ├── api/                # Supabase project, migrations, seeds
│   └── app/                # Next.js dashboard app
├── docs/                   # plan, notes, smoke checklist, test report
├── packages/
│   ├── api/                # tRPC routers, schemas, context
│   ├── supabase/           # shared Supabase clients and generated DB types
│   └── ui/                 # shared UI components
├── package.json            # root scripts
└── turbo.json
```

## Prerequisites

- Bun `1.3.x`
- Docker
- Supabase CLI via project scripts

## Environment

Create local env files from examples:

```bash
cp apps/app/.env.example apps/app/.env
cp apps/api/.env.example apps/api/.env
```

### `apps/app/.env`

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`

For local Supabase, `NEXT_PUBLIC_SUPABASE_URL` usually stays `http://127.0.0.1:54321`.

### `apps/api/.env`

- `PROJECT_ID`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_SECRET`

If you are not using Google auth locally, only set what your local Supabase flow requires.

## Install

```bash
bun install
```

## Local Development

Start the app only:

```bash
bun run dev:app
```

Start all configured workspaces:

```bash
bun run dev
```

## Database Workflows

Reset local database, apply migrations, and run seeds:

```bash
bun run db:reset
```

Start or stop local Supabase manually:

```bash
bun run db:stop
```

Regenerate typed database definitions after schema changes:

```bash
bun run generate:types
```

## Quality Checks

Run app typecheck:

```bash
bun run --filter @v1/app typecheck
```

Run API typecheck:

```bash
bun run --filter @v1/api typecheck
```

Run full linting:

```bash
bun run lint
```

Run tests across workspaces:

```bash
bun run test
```

## Seeded Test Accounts

All seeded users use password `password123`.

### Admin

- `admin1@seed.internlink.local`

### Supervisors

- `supervisor1@seed.internlink.local`

### Students

- `student1@seed.internlink.local`
- `student2@seed.internlink.local`
- `student3@seed.internlink.local`
- `student4@seed.internlink.local`
- `student5@seed.internlink.local`

### Employers

- `employer1@seed.internlink.local`
- `employer2@seed.internlink.local`
- `employer3@seed.internlink.local`

## Useful Seed Scenarios

- `student1`: accepted application, all documents approved, no evaluation yet
- `student2`: accepted application, all documents approved, already evaluated
- `student3`: accepted application, one pending document
- `student4`: accepted application, rejected document, plus one accepted application without documents
- `student5`: rejected application, inactive profile
- `employer3`: inactive profile

## Main Product Areas

- auth and role-based dashboard shell
- internship offers and employer company onboarding
- student applications and employer review flow
- document upload and supervisor document review
- supervisor evaluations
- admin user activation and filtering

## Supporting Docs

- implementation plan: `docs/plan.md`
- RLS smoke checklist: `docs/rls-smoke-checklist.md`
- manual test report: `docs/test-report.md`

## Notes

- `admin.users.setRole` is intentionally not implemented yet.
- Seeds are designed for fast manual E2E verification after `bun run db:reset`.
