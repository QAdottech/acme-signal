# PR exploratory QA runner

Runs Claude Code and Codex + `agent-browser` against Vercel PR previews.

## GitHub PR flow

`.github/workflows/qa-pr-explore.yml` runs automatically on successful non-production Vercel `deployment_status` events.

What it does:

1. Takes the Vercel preview URL and deployed SHA from the deployment event.
2. Finds the open same-repo PR with that exact head SHA.
3. Freezes PR title/body/diff excerpts into one shared context file. The `context` job summary shows its source SHA, brief excerpt, changed filenames, size and hash; download `approved-pr-context` for the exact text.
4. Runs two isolated jobs: Claude and Codex.
5. Uploads metrics and browser evidence artifacts.
6. Shows metrics and whether both agents received the same input bundle hash in the Actions run summary, and updates a single bot comment on the PR with each agent's tested/untested scope and findings, linked to the run. Stale PR revisions are not posted. These are unverified report excerpts, not PR verdicts.

It rejects forks, stale SHAs, production deployments, missing HTTPS preview URLs, and ambiguous SHA→PR matches.

Required repository secrets:

- `ANTHROPIC_API_KEY`
- `CODEX_API_KEY`

Optional repo variables:

- `QA_CLAUDE_MODEL` default: `claude-opus-5-5`
- `QA_CODEX_MODEL` default: `gpt-6-sol`
- `QA_EXPLORE_SECONDS` default: `600`
- `QA_CODEX_RATES` JSON like `{"input":2,"cached":1,"output":8}`
- `QA_CODEX_RATE_EFFECTIVE_DATE` like `2026-01-31`

If `QA_CODEX_RATES` is missing, Codex cost is `unknown`, not zero.

Manual dispatch still exists for diagnostics. It requires the explicit approval string because it bypasses the Vercel event path.

## Local runner

Prepare only, no model/browser execution:

```sh
pnpm qa:explore --agent claude --model claude-opus-5-5 \
  --url http://localhost:3100 --revision DEPLOYED_SHA \
  --charter tests/agent-browser/charters/pr-change.md \
  --context test-results/pr-context.md --seconds 600
```

Execute for real:

```sh
pnpm qa:explore --agent claude --model claude-opus-5-5 \
  --url http://localhost:3100 --revision DEPLOYED_SHA \
  --charter tests/agent-browser/charters/pr-change.md \
  --context test-results/pr-context.md --seconds 600 \
  --execute --confirm-safe-target
```

Repeat with `--agent codex --model ...`.

## Outputs

Each run writes `test-results/agent-browser/explore-<agent>-<uuid>/`:

- `manifest.json` — status, target, versions, timings, usage/cost when available.
- `task.md`, `skill.md`, `contract.md`, `charter.md`, `context.md` — exact inputs.
- `report.md` — agent-authored findings, including separate Tested and Not tested sections.
- `agent.jsonl`, `agent.stderr.log`, `agent-exit.json` — runtime logs.
- `artifacts/` — screenshots, snapshots, HAR, action logs, downloads.
- `metrics.json` and `report-summary.json` in CI — run metrics and bounded report excerpts for the Actions summary and PR comment.

Statuses:

- `prepared`: no execution.
- `review-required`: agent produced a report and browser evidence; review findings manually.
- `blocked`: setup/timeout/tool/output failure.

## Review notes

For PR browser-testing workflows, record:

- preview SHA and URL
- runtime
- token/cost if exposed
- reproduced defects
- false positives
- blockers/tool failures

Do not use raw bug count without reviewing evidence.
