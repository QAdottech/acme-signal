# ACME Signal agent-browser regression execution prompt

You are a QA execution agent. Execute the specified scenario IDs against the supplied target URL using `agent-browser` and produce the required JSON result. Do not inspect application source, Playwright tests, previous findings, or implementation-session history.

## Task inputs

- Target URL: `{{TARGET_URL}}`
- Run ID: `{{RUN_ID}}`
- Scenario IDs: `{{SCENARIO_IDS}}`
- Artifact directory: `{{ARTIFACT_DIR}}`
- Result file path: `{{RESULT_FILE}}`
- Wall-clock budget: `{{WALL_CLOCK_TIMEOUT_MS}}` ms. Record whether an external runner enforces it or it is self-monitored.
- Browser session name: `{{AGENT_BROWSER_SESSION}}`

Read only:

1. `.agents/skills/acme-agent-browser-qa/SKILL.md`
2. `tests/agent-browser/scenarios.json`
3. Official `agent-browser` help/skills for the installed version when needed (`agent-browser skills get core`, `agent-browser --help`)

## Required tool behavior

- Use `agent-browser` for browser interactions.
- Use a fresh, uniquely named session per scenario/repetition. Record each session name and close every session you create on completion or failure; never close unrelated sessions.
- Set viewport to 1440×1000 when supported.
- Keep locale `en-US` and timezone `UTC` if supported by the runtime; record any mismatch.
- Use snapshots after navigation and after DOM changes. Do not reuse stale refs.
- Use screenshots, snapshots, network logs, downloads, and short summaries as evidence.
- Complete workflows through the UI only. Do not inject storage/cookies, call internal app APIs directly, or mutate hidden app state.
- For drag-and-drop, use real browser drag/pointer input.
- For `TASKS-01`, use clock control only if the browser tool supports it. Otherwise use yesterday’s UTC date and record the actual date.

## Judgment rules

- Judge each expected outcome from the shared contract separately.
- A pass/fail requires evidence references. If evidence is missing, status must be `blocked` or `fail` with an agent/tool or undetermined category, not `pass`.
- Do not weaken acceptance criteria. For Reports, visible titles alone do not prove meaningful widgets; verify non-empty numeric/chart data too.
- Missing, malformed, or partial results are non-passing agent/tool outcomes.
- Do not retry automatically. First-run failures stand. Diagnostic reruns require a new run ID.

## Result format

Write exactly one JSON object to `{{RESULT_FILE}}`:

```json
{
  "schemaVersion": 1,
  "runId": "{{RUN_ID}}",
  "mode": "regression",
  "targetUrl": "{{TARGET_URL}}",
  "commit": "unknown if unavailable",
  "dirtyWorktree": "unknown if unavailable",
  "targetBuild": "unknown if unavailable",
  "runtime": {
    "agentRuntime": "name/version or unknown",
    "model": "name/version or unknown",
    "agentBrowserVersion": "agent-browser 0.26.0 or observed version",
    "browserVersion": "Chrome/Chromium version or unknown"
  },
  "environment": {
    "viewport": "1440x1000 or observed mismatch",
    "locale": "en-US or observed mismatch",
    "timezone": "UTC or observed mismatch"
  },
  "budget": {
    "wallClockTimeoutMs": 900000,
    "otherLimits": "describe enforced runtime limits; use unknown for unavailable"
  },
  "terminationReason": "completed | wall-clock-timeout | crash | malformed-result | blocked",
  "humanIntervention": "none or describe",
  "setupAuthoringEffort": "unknown unless measured",
  "results": [
    {
      "scenarioId": "PEOPLE-01",
      "status": "pass | fail | blocked",
      "failureCategory": "application | agent/tool | environment | undetermined | null",
      "modelAssessed": true,
      "runtimeMs": null,
      "browserActionCount": null,
      "tokenUsage": "unknown",
      "cost": "unknown",
      "expectedOutcomes": [
        {
          "id": "people01-created",
          "expected": "contract text",
          "actual": "what was observed",
          "status": "pass | fail | blocked",
          "evidence": ["evidence-id"]
        }
      ],
      "evidence": [
        {
          "id": "evidence-id",
          "type": "screenshot | snapshot | network | download | log | summary | video",
          "path": "relative/or/absolute/path/in/artifact/dir",
          "description": "what this evidence proves"
        }
      ],
      "summary": "short human-readable scenario summary"
    }
  ]
}
```

Use `null` or `"unknown"` for unavailable metrics, not zero.
