# PR-focused exploratory QA: Claude Code and Codex

An opt-in launcher for **one charter and one agent per invocation**. Both adapters use the existing QA skill and agent-browser. No generated Playwright workflows, model SDK, automatic retries, server manager, deployment tooling or PR-comment bot. The manual-dispatch [PR workflow](../../../.github/workflows/qa-pr-explore.yml) runs both adapters against an approved preview; it is not enabled on every PR.

## Requirements and authentication

- Node 22.22.0, pnpm 10.33.4; run `pnpm install --frozen-lockfile`.
- `pnpm exec playwright install chromium` — the runner selects Chromium from the baseline's Playwright installation, not the user's Chrome profile. Agent-browser uses full Chromium in headless mode; Playwright may use the matching headless-shell binary. Record the actual versions/mode when comparing.
- CLI flags verified against **Claude Code 2.1.123**, **Codex CLI 0.147.0**, **agent-browser 0.26.0**. Execution rejects mismatches. Recheck help, adapt and test before changing these versions; neither agent CLI is installed/upgraded by this runner.
- An already running, approved target. Verify synthetic-data permission, disabled real email during build AND runtime, and Turnstile test keys before opting into execution. Use [local server preparation](../README.md#local-target-preparation) if needed.

For local use, log in normally with `claude` and `codex login`. Eligible Claude/ChatGPT subscriptions can provide access; no separate license key is needed. Do not copy credential files into run directories.

For API-based execution, supply `ANTHROPIC_API_KEY` for Claude and `CODEX_API_KEY` for `codex exec` through your secure environment. Codex also supports API login via `printenv OPENAI_API_KEY | codex login --with-api-key`. API usage is billed separately from subscriptions. Claude additionally supports `CLAUDE_CODE_OAUTH_TOKEN` generated using `claude setup-token` for eligible subscription-based automation. Never put secret values in command arguments, prompts, context files or reports.

Official references consulted:
- [Claude CLI](https://code.claude.com/docs/en/cli-reference) and [authentication](https://code.claude.com/docs/en/authentication)
- [Codex non-interactive mode](https://developers.openai.com/codex/noninteractive), [config](https://developers.openai.com/codex/config-reference), [authentication](https://developers.openai.com/codex/auth)
- `pnpm exec agent-browser skills get core` and CLI help for the pinned version

## Prepare paired runs (no model invocation)

Create a UTF-8 PR context file containing a short change description and, optionally, a reviewed diff. Keep it under `test-results/` to avoid committing private context. Exclude credentials, irrelevant generated files, previous findings and either agent's reports. Inputs are limited to 256 KB each.

The context file is the **same frozen input** for both agents. The launcher does not fetch GitHub metadata or inspect app source automatically. `--revision` must identify the deployed build; it is operator-supplied, not inferred from the current checkout. A PR head SHA and a merge-preview SHA may differ.

From the repository root, substituting your values:

```sh
pnpm qa:explore --agent claude --model claude-sonnet-4-6 \
  --url http://localhost:3100 --revision DEPLOYED_SHA \
  --charter tests/agent-browser/charters/pr-change.md \
  --context test-results/pr-context.md --seconds 600

pnpm qa:explore --agent codex --model gpt-5.4 \
  --url http://localhost:3100 --revision DEPLOYED_SHA \
  --charter tests/agent-browser/charters/pr-change.md \
  --context test-results/pr-context.md --seconds 600
```

These commands only compose/archive tasks and inspect CLI versions. They neither navigate the target nor consume model usage. Choose models available to your accounts; availability of the example models has not been tested here.

## Execute

Add **`--execute --confirm-safe-target`** to each command above after reviewing the inputs. This starts a fresh model session and can consume subscription allowances or incur API charges. The safety flag is an operator attestation, not a technical verification of the deployment.

Run the two commands sequentially for the first pilot. Each gets a UUID run directory, fresh temporary workspace and unique browser session. Browser-local data is isolated; if a future target has shared server-side state, provision independent equivalent accounts/data before parallel runs.

For three repetitions, repeat the pair three times without supplying prior outputs. IDs are generated automatically. Preserve failures, label pilot versus scored runs in your review, and use separate runs for base-revision checks and diagnostics. Do not equate three observations with strong statistical evidence.

## Outputs and status

Each invocation writes `test-results/agent-browser/explore-<agent>-<uuid>/`:

- `manifest.json`: supplied target identity, checkout commit/dirty status, requested model, CLI/Chromium versions, budgets, timings, provider-reported usage/cost when available, environment observation and status.
- `task.md`, `skill.md`, `contract.md`, `charter.md`, `context.md`: exact approved input bundle.
- `agent.jsonl`, `agent.stderr.log`, `agent-exit.json`: streamed runtime output and exit details, including on failure.
- `report.md`: agent-authored findings and debrief; may be absent or partial after failure.
- `artifacts/`: timestamped wrapper command/output logs, screenshots, snapshots, downloads, captured HAR, final-state evidence and cleanup logs.
- `summary.md`: runner outcome, **not a scenario verdict**.

`inputHash` identifies the shared skill/contract/charter/context bundle; it should match across paired runs. `taskHash` also includes target, revision and unique run/session inputs and therefore differs. A matching input hash does not remove model variance, site timing differences or runtime-system-prompt differences. Compare target revision, URL, budget and observed environment separately.

Statuses:
- `prepared`: no model/browser test executed.
- `review-required`: process and native runtime completed, a non-empty report exists, and wrapper activity was recorded. **Not proof of test completion or correct findings.**
- `blocked`: setup, timeout, interruption, agent failure, missing output, malformed native completion or cleanup error. Nonzero process exit. Never counted as an application bug automatically.

The runner checks operational completion only. A human must check finding evidence, expected/actual behavior, reproduction and whether the issue predates the PR. Do not score raw finding counts or infer PR causation from presence on a preview deployment.

## Enforcement and known limitations

- macOS/Linux only. No shell-interpolated model command; subprocesses receive argument arrays.
- Wall-clock limit covers the model process group, with up to one second for forced termination. Wrapper commands also have a deadline and a 30-second per-command cap. Setup/cleanup are separate; cleanup commands each have a 15-second cap. SIGINT/SIGTERM trigger cancellation and evidence preservation. SIGKILL/host loss cannot run cleanup; the printed temporary workspace may retain partial artifacts.
- Browser wrapper fixes the session, clears inherited browser settings via a fresh HOME/config, logs calls, disallows storage/state injection, arbitrary eval, routing mocks and profile/CDP attachment, and confines screenshot/download paths to artifacts. The runner uses read-only browser eval solely to record environment settings, not app state.
- The wrapper is **not an adversarial sandbox**: an agent with general shell access could bypass or alter it. Source/hidden-state/PR-instruction restrictions remain partly instructional. Use a disposable host with restricted credentials for untrusted PRs; never run this against arbitrary public/fork code with secrets.
- Claude uses a limited tool list and `dontAsk`, not permission bypass. Codex uses `workspace-write`, network enabled and `never` approvals, not full-access mode. Their permission models differ; a denied operation remains an agent/tool blocker, not permission to relax safeguards. No blanket approval-bypass flags are used.
- Fresh external workspace excludes the application checkout, previous reports and implementation conversation. Only explicitly supplied PR context is copied. User auth stores and managed machine policies still exist; this is not full read isolation. Full-source access is **not** part of this initial adapter.
- Browser navigation is restricted to the approved host plus the Turnstile test-challenge host via agent-browser's allowed-domains setting. This is not a guarantee that every subresource or coding-agent network operation is confined. Review HAR files for sensitive data before sharing.
- Locale/timezone are requested through environment settings and observed in Chromium, not assumed. The viewport is set to 1440×1000. Check the observation and any target/browser mismatch before scoring.
- No token/cost/action cap is claimed. Provider token/cost metadata is retained when present; unavailable values stay unknown. `browserActionCount` counts wrapper commands that navigate or send browser input; it excludes observations and is a local operational metric, not necessarily equivalent to another service's action count. Human intervention/authoring effort must be recorded by the operator.
- Application email safeguards, deployment identity and default demo data are attested by the operator, not independently verified by the launcher. The runner never builds or starts the application and never writes `.next`.
- The agent is expected to write/update `report.md`; restricted runtimes may block a needed tool. Real authenticated model runs have not yet validated these permission settings end to end.

## Verification performed

- CLI version/help inspection for both adapters and pinned agent-browser.
- Automated parsing, adapter, native-completion, path/session restriction and process failure tests in `tests/unit/qaExplore.test.ts`.
- Prepare-only invocations for both agents, with preserved artifacts under `test-results/agent-browser/explore-{claude,codex}-*/`.
- Browser wrapper smoke at `test-results/agent-browser/smoke-366f5f5a/`: isolated Chromium, synthetic local HTML page, genuine click, observed changed text, screenshot, HAR and session closure. Observed 1440×1000, en-US, UTC.
- Synthetic adapter smoke (no inference) at `test-results/agent-browser/explore-claude-541f27f2-*/` and `explore-codex-47fb74dd-*/`: Claude-shaped completion reached review-required; a resistant Codex-shaped process timed out, remained blocked, retained partial output and closed its browser session. These were operational checks, **not application pilots or model runs**.

No authenticated model session, application exploration, QA.tech service run or CI job has been launched by this implementation. Smallest next step: provide a reviewed PR context, approved target URL/deployed revision, and approve the two unscored `--execute` runs.

## GitHub Actions: approved PR runs and cost over time

The `PR exploratory browser QA (approved)` workflow uses `workflow_dispatch` **only** on `main`; it does not launch paid sessions on ordinary PR events. It does not deploy or create a tunnel. Before using it:

1. Configure the `qa-browser-benchmark` GitHub Environment with required reviewers and restricted branch access. Without protection rules, GitHub may create an unprotected environment automatically. Store `ANTHROPIC_API_KEY` and `CODEX_API_KEY` there as environment secrets (not in the PR). Protect keys with spending limits; the runner enforces a wall-clock limit but **not** a token/cost cap.
2. Obtain an approved HTTPS preview URL, verify it actually serves the PR **head SHA**, uses synthetic/default demo data, and cannot deliver real email during either build or runtime. Verify Turnstile test keys. The workflow checks that the supplied SHA equals the open same-repository PR head targeting `main`; it cannot independently prove which build the preview serves. Merge-commit previews need a separate approval/identity strategy.
3. From GitHub Actions select **Run workflow** on `main`; supply PR number, preview URL, deployed head SHA, Claude and Codex model IDs, a common duration, current **model-specific** Codex USD per million token rates as JSON (`{"input":2,"cached":1,"output":8}` is a format example, **not current pricing**) and their effective date. Enter `APPROVE_PAID_QA_SAFE_PREVIEW` after checking safety and spend. Model and rate changes are recorded per run. No paid run has been initiated by this implementation.

The workflow fetches PR title/description and capped file patches with read-only GitHub permissions; it rejects forks and stale SHA. It never checks out the PR head or runs PR build code. It freezes a single untrusted PR context artifact for both agents. The matrix jobs install pinned CLI versions, use distinct browser sessions, and upload artifacts even when an agent is blocked. A final job displays the two metrics side by side in its GitHub **Step Summary**. Download `qa-metrics-claude` and `qa-metrics-codex` for `metrics.json` (90-day retention, subject to repo policy); `qa-evidence-claude` and `qa-evidence-codex` contain raw events/HAR/screenshots (7-day retention). Export metrics separately if comparisons must outlive retention. PR text and browser HAR can contain sensitive data—review artifacts before sharing.

`metrics.json` records model, CLI versions, target SHA, GitHub/run IDs, input hash, status, runtime, token breakdown and USD with provenance:

- **Claude:** CLI `total_cost_usd`, labeled *CLI-reported*, not a provider invoice. CLI result token fields separate ordinary input, cache read, cache creation and output; do not equate them with Codex's token accounting.
- **Codex:** CLI `turn.completed.usage` includes input (of which cached input is a subset) and output. The CLI does not report dollar spend. A dated, exact-model rate card estimates USD: `(input - cachedInput) × inputRate + cachedInput × cachedRate + output × outputRate`, divided by one million. Wrong model or missing usage/rates => unknown, not $0. A blocked run can still have an estimate if the CLI emitted complete usage fields; otherwise it remains unknown. Estimates may exclude other charges; actual billing requires provider billing data.
- A crash, timeout or missing result is **blocked**, not an application bug. Usage/cost may be unknown even if the agent consumed tokens. A successful CLI event plus a report is `review-required`, not proof of valid QA findings.

To compare with QA.tech, record its deployment/build identity, context provided, runtime, tokens and billed cost **only if QA.tech exposes them**; otherwise unknown. Account for setup/authoring, GitHub runner minutes and review time separately. Compare evidence-adjudicated defects, false positives and blockers rather than ranking agents by raw bug counts. Do not claim a difference proves PR context alone caused it; QA.tech may have crawler/usage history and a different runtime.

Automatic PR-triggered paid execution, comments and check-based pass/fail gates are intentionally absent until deployment identity, secret isolation, cost ownership, and untrusted PR boundaries have been approved.

Compare Claude + agent-browser, Codex + agent-browser, and QA.tech as **three operational workflows** with documented context differences. The local arms receive the same charter and supplied PR brief/diff; QA.tech can use its normal product context, recorded by the operator. This is not an equal-context tool experiment and cannot establish that context alone caused a difference. For causal context questions, later vary context while holding the same local runtime/model fixed.
