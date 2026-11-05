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
pnpm test:all            # lint + test typecheck + unit coverage + browser journeys
pnpm test:visual         # screenshot comparisons (tests/visual), opt-in and not run in CI
pnpm test:visual:update  # re-record baselines after an intentional design change
```

Visual tests pin the clock to 2026-11-04 10:00 UTC so relative seed dates render identically. Baselines are recorded on Linux Chromium (`*-visual-linux.png`); a 0.1% pixel tolerance absorbs anti-aliasing but still catches changed text.

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
- Each test/repetition gets a new browser context. Authenticated scenarios log in through the UI using the seeded `james.morrison@example.com` demo user; accounts and sessions are browser-local. No shared auth files or database cleanup are needed.
- No `.env.local` or real credentials are required. The managed server explicitly clears `RESEND_API_KEY` and supplies Turnstile test keys during both build and runtime. **No email is delivered.**
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

## Browser scenarios

Scenario IDs are embedded in test names and reports. These objectives can be reused by Playwright, QA.tech, or agentic browser-testing workflows without requiring the same selectors or exact click sequence.

The repository-local [agent-browser QA skill](../.agents/skills/acme-agent-browser-qa/SKILL.md) executes UI regression and exploratory testing. See [`agent-browser/README.md`](agent-browser/README.md) for setup, reusable prompts, the shared JSON scenario contract, and evidence collection. An optional [Claude/Codex launcher](agent-browser/runner/README.md) and Vercel-preview-triggered [PR workflow](../.github/workflows/qa-pr-explore.yml) support change-focused exploration with token and cost-provenance summaries; neither validates findings or replaces the tests. The Playwright scenarios below remain the deterministic baseline.

Unless marked public, start in a fresh browser and log in with the seeded demo account. Self-service signup is unavailable. Keep the default demo data.

| ID | Objective and expected outcome |
| --- | --- |
| AUTH-01 | **Anonymous:** open People; get redirected to login with `/people` preserved. Submit an unknown account; see invalid-credentials feedback and remain on login. |
| AUTH-02 | Log in with a demo user, log out, open People, log in again; return to People. Reload retains the session. Log out again; People is protected. |
| PEOPLE-01 | Create a contact with name, email, role, company. Reload, find by email, open their page from the name and edit the role there; back on People it shows the new role. Select and delete it through the confirmation dialog, reload and verify absence; existing contacts remain. |
| PEOPLE-02 | Search for Daniel Ek and export CSV. The downloaded file has the expected headers and only that contact, not other contacts. |
| DEALS-01 | Create a $12,000 Lead deal for Spotify owned by Emma Wilson. Filter to it, drag to Qualified, reload. It remains Qualified; the Deals table shows Spotify, $12K, and 30% probability. |
| RECORDS-01 | On Deals, change Platform Integration's stage to Negotiation and its owner to Michael Chen from the table cells; it stays on the list, probability becomes 75%, and both survive a reload. Filter Stage = Negotiation (2 deals, removable chip), select all, Set stage → Proposal (50%). Board shows it under Proposal; Table returns to Deals. |
| RECORDS-02 | On Companies, click Hugging Face's row (not its name): a side preview opens without navigating. Change the owner to Emma Wilson there; the table row updates. Open the full page from the preview, add a note and add the company to Developer Tools from the sidebar; after reload both remain and the list shows the company. |
| RECORDS-03 | ⌘K → "Dario" opens Dario Amodei's person page (CEO at Anthropic). Their Deals tab links to AI Research Partnership. |
| RECORDS-04 | Opening `/deals/does-not-exist` shows a "This deal doesn't exist" state with a link back to Deals. |
| DEMO-01 | Values are exact by default (Biotech Research License shows $45K). `/deals?demoBugs=value-rounding` makes it $40K; Settings shows that switch on (1 of 8) and turning it off restores $45K. |
| DEMO-02 | Delete Startup Plan, then Settings → Reset demo data → Reset data. The app reloads on the pipeline with a "Demo data reset" toast and Startup Plan is back. |
| DEMO-03 | After deleting Startup Plan and logging out, open `/deals?resetDemo=1&demoBugs=value-rounding`, log in, and land on Deals with Startup Plan restored and Biotech Research License at $40K. Delete it again and reload: it stays deleted (no second reset). |
| LISTS-01 | The Lists page has no link nested inside another link; a list card's title opens the list. |
| AUTH-03 | Logging in from `/login?from=//example.com` or `?from=https://example.com/phish` lands on the Sales Pipeline, never off-site. |
| INBOX-01 | `/notifications` and `/emails` land in the Inbox. Opening "Proposal: Enterprise License" shows it with a link to Dario Amodei. Opening an unread notification reduces the unread count by one; Mark all as read empties Unread. |
| REPORTS-01 | Create a named custom report from Pipeline by Stage. Reload; its three widgets and active-deal summary render. Delete it, reload; it is absent while Pipeline Overview remains. |
| TASKS-01 | At a fixed date of 2026-06-01 UTC, create a task due 2026-05-31. It appears under Overdue. Complete it; it disappears from Overdue and remains checked/Done after reload. |
| SIGN-01 | **Public:** open a proposal, submit without name/consent and verify all errors. Name plus terms consent alone still fails. With both consents, signing shows confirmation. |
| NAV-01 | Open the sidebar Search (⌘K/Ctrl+K). Typing `anthro` shows Anthropic but not loosely matching companies; selecting it opens the company. From there, "Create task" opens Tasks with the Create Task dialog. Press G then D to reach Deals; typing in a field does not trigger shortcuts. |
| NETWORK-01 | **Public:** send the custom-header request. Verify the actual POST headers/body, 200 response, echoed values, and success feedback in the UI. |

When evaluating browser-testing workflows:

1. Use the same commit/build, demo data, Chromium version, desktop viewport (1440×1000), locale (`en-US`), and timezone (`UTC`). Use equivalent clock control for TASKS-01, or yesterday's UTC date if the runner cannot fix time; record that difference.
2. Start with a clean browser for each scenario. Disable real email delivery on any deployed target.
3. Keep the same expected outcomes above. Distinguish discovering new bugs from executing these known regression checks.
4. Record first-run failures, rerun results, scenario runtime, setup/build time separately, authoring/maintenance effort, and evidence quality. Retry count is **zero** here so flakiness is not hidden.
5. Run repeated trials (`--repeat-each=3`) before drawing conclusions. Do not equate a green run, test count, or unit coverage percentage with defect-detection effectiveness.

### Evidence and CI

- `playwright-report/`: HTML results.
- `test-results/e2e.json`: machine-readable scenarios, outcomes, and timing.
- `test-results/artifacts/`: traces, screenshots, and videos retained for failures.
- `test-results/unit.xml`: JUnit results when `CI=1`.
- `.github/workflows/tests.yml`: independent unit/typecheck and Chromium jobs on PRs, pushes to `main`, and manual runs. Artifacts are retained for seven days, including on failure.

All generated output is gitignored. Traces can contain form values and browser state; use demo accounts and synthetic scenario data, and review artifacts before sharing.

## Extending the baseline

- Add domain tests under `tests/unit/*.test.ts`; use `// @vitest-environment node` for server-only code. Test behavior with controlled input, not snapshots of all demo data.
- Add browser tests under `tests/e2e/*.spec.ts`; use `signedInPage` from `fixtures.ts` when login is a prerequisite. Prefer roles, labels, and visible text; scope repeated controls to a dialog or row. No sleeps or CSS-layout-dependent selectors.
- Assert the resulting data/visible state, including after reload where persistence matters. A successful click or HTTP 200 alone is not enough.
- Keep a correct failing regression when it exposes a real bug. Do not skip it or change its expected outcome merely to get green CI.
- Next candidates: company/collection workflows, contact bulk status changes, role enforcement, full report calculations, CSV edge cases, email provider integration, and Firefox/WebKit/mobile coverage. These are **not covered comprehensively** by this initial suite.

The existing Next configuration skips app-wide TypeScript and ESLint checks during builds. `test:typecheck` checks the testing code and its imported dependencies; it is not an app-wide lint/typecheck gate.
