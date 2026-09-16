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

## Vercel previews

Vercel inlines `NEXT_PUBLIC_*` at **build** time. Project-level Preview env vars point at the production Supabase project, so a PR that only changes UI keeps using the shared DB (and the nightly reset).

A PR that adds/changes files under `supabase/migrations/` would 500 against that schema. [Preview database](.github/workflows/preview-db.yml) handles that:

1. Diff `supabase/migrations` vs the PR base.
2. If nothing changed (and this PR never created a branch), no-op — Preview stays on production.
3. Otherwise create/reuse a Supabase branch named `pr-<n>` (`git_branch` = the Git head ref), wait until `ACTIVE_HEALTHY`.
4. First time: `supabase db reset --db-url --yes` (migrations + seed). Later pushes: `db push` (falls back to reset if history diverged).
5. Upsert git-branch-scoped Vercel env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
6. Redeploy the latest preview (`forceNew=1`) so Next actually bakes in the branch URL. The first Vercel build usually raced this and still had production keys.
7. Close/merge the PR → delete the branch + those git-branch env vars.

Nightly reset is linked to the production project only. Preview branches are not reset.

Enable [branching](https://supabase.com/docs/guides/deployment/branching) on the Supabase project (Pro). **Don't** also turn on GitHub Automatic branching / the Vercel marketplace sync while this workflow is active — you'd get two branches and fighting env vars.

The official alternative, if you'd rather click than run Actions: GitHub integration with **Automatic branching** + **Supabase changes only**, plus the Vercel Supabase integration. Same race (PR-open env sync vs first preview build); they redeploy for you. That path also branches on `config.toml` / functions / seed, not just migrations.

## GitHub Actions

| Workflow | Trigger | What it does |
| --- | --- | --- |
| [CI](.github/workflows/ci.yml) | PR + push to `main` | Local `supabase db reset`, schema lint, typecheck, Next.js build |
| [Preview database](.github/workflows/preview-db.yml) | PR open/sync/reopen/close, only when migrations changed (or a branch already exists) | Ephemeral `pr-<n>` Supabase branch + git-branch Vercel env + redeploy |
| [Migrate](.github/workflows/migrate.yml) | push of `supabase/migrations/**` to `main`, or manual | `supabase db push` to the linked (production) project |
| [Nightly database reset](.github/workflows/nightly-reset.yml) | `0 4 * * *` UTC, or manual | `supabase db reset --linked --yes` — production only |

Remote jobs need these repository secrets:

- `SUPABASE_ACCESS_TOKEN` — personal access token from [Supabase account tokens](https://supabase.com/dashboard/account/tokens)
- `SUPABASE_PROJECT_ID` — production project ref
- `SUPABASE_DB_PASSWORD` — database password used by `supabase link` (migrate / nightly only)
- `VERCEL_TOKEN` — token that can write project env + create deployments
- `VERCEL_PROJECT_ID` — Vercel project id (`prj_…`)
- `VERCEL_TEAM_ID` (or `VERCEL_ORG_ID`) — required if the project lives on a team

The hosted app also needs `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) as Production / default Preview env. RLS is enabled with open policies because this is a shared QA demo.
