---
name: pr
description: Draft or create GitHub pull requests for this repo. Use when the user asks for a PR, PR body, pull request summary, or to open a PR.
metadata:
  credits:
    inspired-by: https://github.com/mattpocock/skills/blob/main/skills/in-progress/pr/SKILL.md
---

# PR

Use this skill to draft or create pull requests for this repo.

## Rules

- Do not create, push, or open a PR unless the user explicitly asks.
- If the user asks for a draft/body only, output Markdown and stop.
- Inspect the actual diff before writing the PR body.
- Keep prose brief and concrete.
- Include verification evidence from commands actually run.
- If no verification was run, say so.
- Do not add AI/agent attribution.

## Gather context

```sh
git status --short
git diff --stat
git diff
```

If commits exist and the user wants a PR for the branch:

```sh
git log --oneline --decorate -n 10
git diff --stat origin/main...HEAD
git diff origin/main...HEAD
```

## PR body template

```markdown
## Summary

<smallest useful sketch of the change: bullets, tree, or diff snippet>

## Evidence

- <command/result or manual check>

## Merge Danger

**Door:** <one-way or two-way>

**Blast Radius:** <one-word scope>

<optional risk note>
```

## Summary guidance

Pick the shortest shape that explains the change.

For workflow changes:

```text
Vercel preview deployment
  resolve matching same-repo PR
  freeze PR context
  run Claude + Codex browser exploration
  upload metrics/evidence
```

For file responsibility:

```text
.github/workflows/qa-pr-explore.yml   # CI trigger and jobs
tests/agent-browser/runner/*.mjs      # runner/context/metrics helpers
tests/agent-browser/**/*.md           # operator docs and charters
```

For small code changes, use a compact diff sketch:

```diff
- manual workflow_dispatch only
+ automatic Vercel preview deployment_status trigger
+ SHA -> open same-repo PR resolution
```

## Creating the PR

Only when explicitly requested:

```sh
gh pr create --title "<title>" --body-file <body-file>
```

Before running `gh pr create`, confirm:

- branch is correct
- remote is correct
- body is final
- no secrets are in the diff or PR body
