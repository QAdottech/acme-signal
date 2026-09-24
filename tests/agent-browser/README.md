# Agent-browser QA

This is the in-repo agentic browser testing setup.

- Playwright remains the deterministic baseline.
- QA.tech can run from PR previews externally.
- Claude/Codex + `agent-browser` run from Vercel PR preview deployment events via `.github/workflows/qa-pr-explore.yml`.

## Setup

```sh
pnpm install --frozen-lockfile
pnpm exec agent-browser --version          # pinned: 0.26.0
pnpm exec agent-browser skills get core
pnpm test:agent:doctor
pnpm exec agent-browser install            # if Chromium is missing
```

## Local target

```sh
(
  export RESEND_API_KEY=''
  export NEXT_PUBLIC_APP_URL='http://localhost:3100'
  export NEXT_PUBLIC_TURNSTILE_SITE_KEY='1x00000000000000000000AA'
  export TURNSTILE_SECRET_KEY='1x0000000000000000000000000000000AA'
  export NEXT_TELEMETRY_DISABLED=1
  pnpm build && pnpm start --hostname localhost --port 3100
)
```

## Manual skill examples

Regression:

> Use the acme-agent-browser-qa skill to execute PEOPLE-01 against http://localhost:3100 with a 15-minute budget. Use a fresh session and unique run directory. Capture evidence and report every expected outcome.

Exploration:

> Use the acme-agent-browser-qa skill to explore People workflows for 20 minutes. Focus on persistence, destructive actions and filtered export correctness. Keep timestamped observations and attempt to reproduce issues within budget.

Structured prompts live in:

- `prompts/regression.md`
- `prompts/exploration.md`

Shared scenario contract:

- `scenarios.json`

## PR exploration

See [`runner/README.md`](runner/README.md).

The PR workflow runs Claude and Codex against successful Vercel preview deployments for same-repo PRs, stores evidence, and emits comparable metrics. It does not replace Playwright and does not automatically validate findings.

## Evidence

Save screenshots, snapshots, action logs, HAR files, downloads, and summaries under:

```text
test-results/agent-browser/<unique-run-id>/
```

That directory is gitignored.
