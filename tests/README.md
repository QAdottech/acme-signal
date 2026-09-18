# Testing baseline

Two complementary layers:

- **Vitest** tests domain behavior and server boundaries directly. Browser persistence uses real jsdom `localStorage`; it is cleared before every test. Time-sensitive cases use a fixed clock. Turnstile's external HTTP call is mocked, not the CRM data layer.
- **Playwright** exercises complete user journeys in Chromium against a local **production build**. Tests use the actual pages, middleware, API, and browser storage. They do not inject authentication state or mock application requests.

This is a starting regression baseline, not comprehensive coverage or a production security audit.

## Setup and commands

Use Node **22.22.0** (also used in CI) and pnpm **10.33.4** (`packageManager` in `package.json`).

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
# Linux/CI: pnpm exec playwright install --with-deps chromium

pnpm test                # unit tests, once
pnpm test:watch          # unit tests, watch mode
pnpm test:coverage       # text + HTML + LCOV coverage
pnpm test:typecheck      # test files, configs, and their imported TS dependencies
pnpm test:e2e            # build, start server, run Chromium, stop server
pnpm test:e2e:ui         # interactive Playwright runner
pnpm test:e2e:report     # open the last HTML report
pnpm test:all            # test typecheck + unit coverage + browser journeys
```

Targeted runs and repeatability checks:

```sh
pnpm test tests/unit/dealData.test.ts
pnpm test:e2e --grep AUTH-02
pnpm test:e2e --repeat-each=3
pnpm exec playwright show-trace path/to/trace.zip
```

### Isolation and side effects

- Playwright reserves **http://localhost:3100**, never reuses an existing server, and builds automatically. Leave that port free. Do not run another Next build/dev server in the same checkout simultaneously: both write `.next`.
- Use `localhost` consistently. Next.js normalizes loopback IP URLs in redirects; mixing `127.0.0.1` with `localhost` splits cookies and `localStorage` across origins.
- Each test/repetition gets a new browser context. Authenticated scenarios create `playwright@example.test` through the signup UI. Reusing that synthetic name is safe because accounts are browser-local; no shared auth files or database cleanup are needed.
- No `.env.local` or real credentials are required. The managed server explicitly clears `RESEND_API_KEY` and supplies Turnstile test keys during both build and runtime. Signup hits the real email API's documented skipped-delivery path. **No email is delivered.**
- The existing signing page simulates completion in React state. Its test checks validation and confirmation, not signature persistence, countersigning, or email delivery.
- The build currently fetches a Google font (`next/font/google`); a cold build needs internet access. Dependency/browser installation also requires internet.

## Unit coverage

| File | Behavior checked |
| --- | --- |
| `unit/dealData.test.ts` | Create/read/update/delete, organization lookup, empty storage, open-stage and probability-weighted pipeline totals |
| `unit/taskData.test.ts` | Persistence, missing-task updates, related-entity lookup, overdue UTC boundary, completed-task exclusion |
| `unit/reports.test.ts` | Custom report lifecycle, unknown templates, pipeline metrics, empty datasets, unknown data sources |
| `unit/middleware.test.ts` | Login redirects, return paths, public routes, demo sessions, Basic Auth challenge |
| `unit/network-test.test.ts` | Header/body echo and missing/blank request-ID rejection |
| `unit/turnstile.test.ts` | Missing secret, verification request, challenge rejection, network failure propagation |

Coverage includes **all** `lib` modules, `middleware.ts`, and API routes, including untested files. HTML/LCOV output lives in `coverage/`. UI components/pages are not included, and Playwright runs do not contribute to this number. There is no arbitrary coverage threshold yet: use the report to identify gaps, not as a claim that the whole application is tested.

Vite 7 is an explicit testing dependency because Vite 8 produced TSX coverage parsing errors with this repo's `jsx: preserve` configuration. Vitest does not replace Next's app bundler.

## Browser scenarios / QA.tech comparison contract

Scenario IDs are embedded in test names and reports. Give QA.tech the same objectives and expected outcomes, without requiring the same selectors or exact sequence of clicks.

The repository-local [agent-browser QA skill](../.agents/skills/acme-agent-browser-qa/SKILL.md) executes UI regression and exploratory testing. See [`agent-browser/README.md`](agent-browser/README.md) for setup, reusable prompts, the shared JSON scenario contract, evidence collection and comparison guidance. An optional [Claude/Codex launcher](agent-browser/runner/README.md) supports PR-focused exploratory sessions; it does not validate findings or replace the tests. The Playwright scenarios below remain the deterministic baseline.

Unless marked public, start in a fresh browser, sign up with a synthetic account and full name, then continue to the app. Keep the default demo data.

| ID | Objective and expected outcome |
| --- | --- |
| AUTH-01 | **Anonymous:** open People; get redirected to login with `/people` preserved. Submit an unknown account; see invalid-credentials feedback and remain on login. |
| AUTH-02 | Sign up, log out, open People, log in again; return to People. Reload retains the session. Log out again; People is protected. |
| PEOPLE-01 | Create a contact with name, email, role, company. Reload, find by email, edit role, reload and verify. Delete with confirmation, reload and verify absence; existing contacts remain. |
| PEOPLE-02 | Search for Daniel Ek and export CSV. The downloaded file has the expected headers and only that contact, not other contacts. |
| DEALS-01 | Create a $12,000 Lead deal for Spotify owned by Emma Wilson. Filter to it, drag to Qualified, reload. It remains Qualified; the Deals table shows Spotify, $12K, and 30% probability. |
| REPORTS-01 | Create a named custom report from Pipeline by Stage. Reload; its three widgets and active-deal summary render. Delete it, reload; it is absent while Pipeline Overview remains. |
| TASKS-01 | At a fixed date of 2026-06-01 UTC, create a task due 2026-05-31. It appears under Overdue. Complete it; it disappears from Overdue and remains checked/Done after reload. |
| SIGN-01 | **Public:** open a proposal, submit without name/consent and verify all errors. Name plus terms consent alone still fails. With both consents, signing shows confirmation. |
| NETWORK-01 | **Public:** send the custom-header request. Verify the actual POST headers/body, 200 response, echoed values, and success feedback in the UI. |

For an apples-to-apples comparison:

1. Use the same commit/build, demo data, Chromium version, desktop viewport (1440×1000), locale (`en-US`), and timezone (`UTC`). Use equivalent clock control for TASKS-01, or yesterday's UTC date if the other runner cannot fix time; record that difference.
2. Start with a clean browser for each scenario. Disable real email delivery on the QA.tech target too; this repository does not configure an external deployment.
3. Keep the same expected outcomes above. Distinguish discovering new bugs from executing these known regression checks.
4. Record first-run failures, rerun results, scenario runtime, setup/build time separately, authoring/maintenance effort, and evidence quality. Retry count is **zero** here so flakiness is not hidden.
5. Run repeated trials (`--repeat-each=3`) before drawing conclusions. Do not equate a green run, test count, or unit coverage percentage with defect-detection effectiveness. A stronger later comparison can use an identical, documented set of seeded regressions for both tools.

### Evidence and CI

- `playwright-report/`: HTML results.
- `test-results/e2e.json`: machine-readable scenarios, outcomes, and timing.
- `test-results/artifacts/`: traces, screenshots, and videos retained for failures.
- `test-results/unit.xml`: JUnit results when `CI=1`.
- `.github/workflows/tests.yml`: independent unit/typecheck and Chromium jobs on PRs, pushes to `main`, and manual runs. Artifacts are retained for seven days, including on failure.

All generated output is gitignored. Traces can contain form values and browser state; keep using synthetic accounts and review artifacts before sharing.

## Extending the baseline

- Add domain tests under `tests/unit/*.test.ts`; use `// @vitest-environment node` for server-only code. Test behavior with controlled input, not snapshots of all demo data.
- Add browser tests under `tests/e2e/*.spec.ts`; use `signedInPage` from `fixtures.ts` when login is a prerequisite. Prefer roles, labels, and visible text; scope repeated controls to a dialog or row. No sleeps or CSS-layout-dependent selectors.
- Assert the resulting data/visible state, including after reload where persistence matters. A successful click or HTTP 200 alone is not enough.
- Keep a correct failing regression when it exposes a real bug. Do not skip it or change its expected outcome merely to get green CI.
- Next candidates: company/collection workflows, contact bulk status changes, role enforcement, full report calculations, CSV edge cases, email provider integration, and Firefox/WebKit/mobile coverage. These are **not covered comprehensively** by this initial suite.

The existing Next configuration skips app-wide TypeScript and ESLint checks during builds. `test:typecheck` checks the testing code and its imported dependencies; it is not an app-wide lint/typecheck gate.
