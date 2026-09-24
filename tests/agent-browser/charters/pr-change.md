# PR change exploration

## Mission

Explore the deployed PR's changed user-facing behavior and adjacent workflows to discover observable regressions, broken assumptions and usability risks.

## Scope

Use the supplied PR brief/diff to choose a focused charter before interacting. Record the concrete risks selected and why. If no PR context is supplied, follow the operator's explicit area; do not invent changes.

Consider a few relevant risks, rather than turning this into a checklist:

- Can a user complete the affected workflow with synthetic data?
- Do changes survive navigation/reload where persistence is expected?
- Do validation, cancellation and destructive actions leave coherent state?
- Does the change break an adjacent workflow or meaningful rendered output?

Investigate unexpected behavior within budget. Reproduce findings when possible and preserve intermittent observations. A finding on the PR deployment is not automatically a PR-introduced regression; base-revision verification is a separate diagnostic run.

## Reporting

Report what was examined and what was not. Separate confirmed defects, suspected issues, questions and usability suggestions. No bug-count quota and no unsupported coverage or success claims.
