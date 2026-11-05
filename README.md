# ACME Signal

A CRM platform for managing contacts, organizations, and collections.

This project is a demo CRM application with standard automated tests and PR browser-testing workflows.

## Development

Use Node 22.22.0 and pnpm 10.33.4.

```sh
pnpm install --frozen-lockfile
cp .env.example .env.local   # then fill in any required secrets locally
pnpm dev
```

## Testing

```sh
pnpm exec playwright install chromium
pnpm test           # Vitest unit tests
pnpm test:e2e       # Playwright journeys against a managed production build
pnpm lint           # ESLint (next/core-web-vitals)
pnpm test:all       # Lint, test typecheck, unit coverage, and E2E
pnpm test:visual    # Screenshot comparisons of the main screens (opt-in, not in CI)
```

See [tests/README.md](tests/README.md) for coverage, isolation, CI, debugging, and browser scenario contracts.

## Demo controls

ACME Signal exists to demo QA.tech's testing agents, so it is clean by default and has switches for running a demo:

- **Reset demo data:** Settings → Demo data, or "Reset demo data" in the ⌘K menu. Restores the seeded companies, people, deals and activity (dated relative to today). Login, custom reports and demo bugs are kept.
- **Demo bugs:** Settings → Demo bugs lists deliberate, believable defects (all off by default) for the agents to find, such as deal values rounding down or bulk delete removing the wrong deal. A link can set them for any browser:
  - `/?demoBugs=value-rounding,stale-probability` turns those on
  - `/?demoBugs=all` / `/?demoBugs=none`
- **Fresh start per run:** add `resetDemo=1` to any link to reset the data first. It combines with demo bugs, so one agent start URL sets up the whole scenario, for example `/deals?resetDemo=1&demoBugs=value-rounding`. Both params are applied once and then removed from the address bar, so a reload doesn't reset again. They also survive the login redirect.

  The catalogue lives in [`lib/demo-bugs.ts`](lib/demo-bugs.ts), and each call site is marked `DEMO BUG: <id>`.
