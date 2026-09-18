# Agent-browser QA

Use the [QA skill](../../.agents/skills/acme-agent-browser-qa/SKILL.md) to test the running application through its UI. The skill covers regression, exploration, bug reproduction, evidence collection and cleanup. Existing Vitest and Playwright tests remain the deterministic baseline.

Use the skill directly, or use the optional [Claude/Codex exploration launcher](runner/README.md) for paired PR-focused sessions with a wall-clock timeout, isolated browser sessions and streamed artifacts. The launcher is prepare-only by default; actual model execution is opt-in. It checks runtime completion, not the truth of findings. Server preparation and evidence review remain operator responsibilities.

## Setup

Use Node 22.22.0 and pnpm 10.33.4:

```sh
pnpm install --frozen-lockfile
pnpm exec agent-browser --version          # pinned: 0.26.0
pnpm exec agent-browser skills get core    # official version-matched guide
pnpm test:agent:doctor
# If browser installation is needed:
pnpm exec agent-browser install
```

The version, CLI help and bundled core skill were inspected during setup. Do not silently upgrade the tool or assume system Chrome matches the Playwright browser version.

### Local target preparation

An operator can start a safe production server using the same environment safeguards as `playwright.config.ts`. First verify localhost:3100 is free and no build/dev server is using this checkout's `.next`. Do not reuse or kill unrelated processes.

Run in a dedicated terminal from the repository root:

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

The variables apply during both build and runtime. Stop your server with Ctrl-C when testing is complete. This manual setup does not provide build locking, a timeout or automatic cleanup. Do not run Playwright's managed server concurrently on the same port/checkout.

## Use the skill

Ask your coding agent, for example:

> Use the acme-agent-browser-qa skill to execute PEOPLE-01 against http://localhost:3100 with a 15-minute budget. Use a fresh session and unique run directory. Capture evidence and report every expected outcome.

Then execute DEALS-01 in a fresh context/session to exercise drag-and-drop and persistence. For exploration:

> Use the acme-agent-browser-qa skill to explore People workflows for 20 minutes. Focus on persistence, destructive actions and filtered export correctness. Keep timestamped observations and attempt to reproduce issues within budget.

Agents must support `.agents/skills` discovery or be explicitly directed to read the skill. Its frontmatter was validated using the official `skills-ref` validator; discovery in every runtime is not guaranteed.

For structured results, use [prompts/regression.md](prompts/regression.md) or [prompts/exploration.md](prompts/exploration.md). Fill their `{{...}}` task inputs before use: URL, IDs/scope, budget, unique session, artifact directory and result path. The JSON blocks describe a reporting convention, not an automatically validated schema; replace sample values with actual observations and budgets.

## Evidence and limitations

- Save screenshots, snapshots, timestamped action/output logs, relevant browser network captures, downloads and a short summary under `test-results/agent-browser/<unique-run-id>/`. This directory is gitignored. Existing diagnostic artifacts have been retained.
- Use synthetic data, redact before sharing, and close only sessions/processes created for the task. Never overwrite a first-run result; use new IDs for diagnostics.
- Check each contract outcome against evidence. Valid JSON, a command succeeding or a green summary alone does not prove success. Label model-assessed judgments and use `unknown` for unmeasured metrics.
- Source-access restrictions and self-monitored budgets are instructions, not enforced isolation/timeouts. A fresh context is not a filesystem sandbox. Use runtime controls when enforcement is required and record which controls were actually active.
- No actual agent-browser PEOPLE-01/DEALS-01 workflow pilot has been completed. Earlier prompt-generation and missing-result smoke checks were preparation checks for the removed runner, not browser tests. The targeted Playwright baseline passed both scenarios; that does not validate this skill's execution.

## Optional comparison guidance

For PR-focused exploration with supplied change context, see the [launcher guide](runner/README.md#later-pr-integration). That operational comparison intentionally permits the supplied PR brief/diff and records context differences. The black-box regression comparison below is a separate experiment.

The [shared contract](scenarios.json) can also be supplied to QA.tech. Keep the skill itself focused on QA, not on favoring either approach.

Before scored comparison:

1. Complete unscored PEOPLE-01 and DEALS-01 pilots in fresh execution contexts. Give execution agents only the skill's testing rules, contract, task inputs, browser documentation and their own observations/artifacts—not source, Playwright implementations, this README's history or previous findings.
2. Freeze identical builds/demo data, scenario expectations, budgets and environment settings. Match Chromium, viewport 1440×1000, locale en-US and timezone UTC where supported; record mismatches. Agree equivalent clock control or the same actual UTC dates for TASKS-01.
3. Use a fresh agent context/browser session for each scenario and each of three independent repetitions. Preserve first-run failures; separate setup/build/authoring effort and pilot tuning from scored execution. Use runtime-enforced wall-clock limits rather than claiming prompt-only limits are enforced.
4. Review evidence independently where practical, especially CSV contents, actual network traffic and report widget data. Reports require meaningful numeric/chart output, not titles alone. Adapt tool/output mechanics for each approach without weakening acceptance criteria.
5. Keep regression outcome completion separate from exploratory discovery. For exploration use equivalent charters/budgets and adjudicate reproduction, impact, duplicates and false positives—not raw bug counts. Classify crashes, missing results and timeouts as non-passing infrastructure/agent outcomes, not app defects.

QA.tech needs an approved reachable deployment and verified build/runtime email safeguards. Do not deploy, tunnel, publish or launch paid runs without approval. No QA.tech run has been performed.

Three repetitions provide a small descriptive sample, not a general ranking. All-green regression runs do not establish defect-detection ability. A later seeded-regression experiment requires separate approval and identical builds for both approaches; do not insert defects now.
