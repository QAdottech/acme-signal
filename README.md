# ACME Signal

A CRM platform for managing contacts, organizations, and collections.

This project is a demo application set up for QA.tech testing purposes. Persistent data lives in Postgres via [Supabase](https://supabase.com). Mutations from QA runs are wiped by a nightly reset that re-applies migrations and seed data.

## Local development

```bash
pnpm install
npx supabase start   # or: pnpm db:start
cp .env.example .env.local
pnpm dev
```

`supabase start` boots the local API. Copy `API_URL` and `ANON_KEY` from `npx supabase status` into `.env.local`.

To rebuild the local database from `supabase/migrations` + `supabase/seed.sql`:

```bash
pnpm db:reset
```

Seeded login:

- `prj-anip7v@qatech.email`
- password: `testingpassword`

## Schema changes

1. Add a file under `supabase/migrations/` (`supabase migration new <name>`).
2. Open a PR. CI starts a local Postgres, applies every migration, seeds, lints the schema, typechecks, and builds the app.
3. Merging to `main` runs [Migrate](.github/workflows/migrate.yml), which `supabase db push`es new migrations to the linked project.

Update `supabase/seed.sql` when demo fixtures should change. Seed is applied on local `db reset` and on the nightly remote reset, not on `db push`.

## GitHub Actions

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [CI](.github/workflows/ci.yml) | PR + push to `main` | Local `supabase db reset`, schema lint, typecheck, Next.js build |
| [Migrate](.github/workflows/migrate.yml) | push of `supabase/migrations/**` to `main`, or manual | `supabase db push` to the linked project |
| [Nightly database reset](.github/workflows/nightly-reset.yml) | `0 4 * * *` UTC, or manual | `supabase db reset --linked --yes` — drops remote schema, reapplies migrations, reseeds |

Remote jobs need these repository secrets:

- `SUPABASE_ACCESS_TOKEN` — personal access token from [Supabase account tokens](https://supabase.com/dashboard/account/tokens)
- `SUPABASE_PROJECT_ID` — project ref
- `SUPABASE_DB_PASSWORD` — database password used by `supabase link`

The hosted app also needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Vercel / deploy env). RLS is enabled with open policies because this is a shared QA demo.
