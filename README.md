# ACME Signal

A CRM platform for managing contacts, organizations, and collections.

This project is a demo application set up for QA.tech testing purposes.

## Development

Use Node 22.22.0 and pnpm 10.33.4.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

## Testing

```sh
pnpm exec playwright install chromium
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright journeys against a managed production build
pnpm test:all       # Test typecheck, unit coverage, and E2E
```

See [tests/README.md](tests/README.md) for coverage, isolation, CI, debugging, and the scenario-by-scenario QA.tech comparison contract.
