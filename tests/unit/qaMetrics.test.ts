// @vitest-environment node
import { describe, expect, test } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { comparisonTable, reportSections, runMetrics } from "../agent-browser/runner/metrics.mjs";

const manifest = { agent: "codex", requestedModel: "gpt-example", runId: "r1", targetRevision: "a".repeat(40), status: "blocked", terminationReason: "timeout", inputHash: "abc",
  metrics: { tokenUsage: { input: 200, cachedInput: 100, output: 50, total: 250 }, runtimeMs: 2000, cost: "unknown" } };
const rates = { model: "gpt-example", effectiveDate: "2026-09-01", inputUsdPerMillion: 2, cachedInputUsdPerMillion: 1, outputUsdPerMillion: 8 };

describe("PR QA usage summary", () => {
  test("estimates cost with explicitly dated model-specific rates even on timeout", () => {
    expect(runMetrics(manifest, 42, rates)).toMatchObject({ status: "blocked", cost: { usd: 0.0007, source: "rate-card-estimate", billedAmountKnown: false, rateCard: rates } });
  });
  test("leaves cost unknown when rates do not match the selected model or usage is absent", () => {
    expect(runMetrics(manifest, 42, { ...rates, model: "another-model" }).cost).toMatchObject({ usd: null, source: "unknown" });
    expect(runMetrics(null, 42)).toMatchObject({ status: "blocked", cost: { usd: null }, tokens: null });
  });
  test("Claude CLI amount is labeled as a report, not actual billed spend", () => {
    expect(runMetrics({ ...manifest, agent: "claude", metrics: { cost: 0.03, tokenUsage: null } }, 42).cost).toMatchObject({ usd: 0.03, source: "claude-cli-reported", billedAmountKnown: false });
  });
  test("CLI publishes metrics on blocked runs and marks absent peer unknown", () => {
    const dir = mkdtempSync(join(tmpdir(), "qa-metrics-"));
    try {
      const runs = join(dir, "runs");
      mkdirSync(join(runs, "r1"), { recursive: true });
      writeFileSync(join(runs, "r1", "manifest.json"), JSON.stringify(manifest));
      writeFileSync(join(runs, "r1", "report.md"), "## Environment and scope actually examined, plus untested areas\nTested People; not tested Deals. <img src=x>\n## Confirmed defects\nNone.\n## Suspected/intermittent issues\nPossible task picker issue.\n");
      writeFileSync(join(dir, "rates.json"), JSON.stringify(rates));
      const tool = join(process.cwd(), "tests/agent-browser/runner/metrics.mjs");
      execFileSync(process.execPath, [tool, "run", runs, "42", join(dir, "rates.json")]);
      const saved = JSON.parse(readFileSync(join(runs, "r1", "metrics.json"), "utf8"));
      expect(saved).toMatchObject({ status: "blocked", cost: { usd: 0.0007 } });
      const review = JSON.parse(readFileSync(join(runs, "r1", "report-summary.json"), "utf8"));
      expect(review).toMatchObject({ scope: "Tested People; not tested Deals. <img src=x>", confirmed: "None.", suspected: "Possible task picker issue." });
      const artifacts = join(dir, "artifacts");
      mkdirSync(join(artifacts, "qa-metrics-codex", "r1"), { recursive: true });
      writeFileSync(join(artifacts, "qa-metrics-codex", "r1", "metrics.json"), JSON.stringify(saved));
      writeFileSync(join(artifacts, "qa-metrics-codex", "r1", "report-summary.json"), JSON.stringify(review));
      const output = execFileSync(process.execPath, [tool, "compare", artifacts, "42"], { encoding: "utf8" });
      expect(output).toContain("Tested People; not tested Deals.");
      expect(output).toContain("Possible task picker issue.");
      expect(output).not.toContain("<img src=x>");
      expect(output).toContain("Findings are unverified");
      expect(output).toContain("claude: no report available");
      expect(output).toContain("claude");
      expect(output).toContain("0.0007");
      expect(output).toContain("blocked");
    } finally { rmSync(dir, { recursive: true, force: true }); }
  });
  test("extracts only the agent's scope and findings sections, bounded and safe to render", () => {
    const sections = reportSections("## Environment and scope actually examined\nTested People. Not tested Deals. <img src=x>\n## Confirmed defects\nNone.\n## Suspected/intermittent issues\n" + "x".repeat(6000) + "\n## Questions\nIgnore this section");
    expect(sections.scope).toContain("Tested People. Not tested Deals.");
    expect(sections.confirmed).toBe("None.");
    expect(sections.suspected.length).toBeLessThan(4500);
    expect(sections.scope).not.toContain("Questions");
    expect(reportSections("unstructured report")).toEqual({ scope: null, confirmed: null, suspected: null });
  });
  test("metrics table shows unknown values and escapes untrusted cell text", () => {
    const summary = comparisonTable([runMetrics({ ...manifest, agent: "fake|bad\nrow", metrics: {} }, 42)]);
    expect(summary).toContain("unknown");
    expect(summary).not.toContain("fake|bad");
    expect(summary).toContain("not invoices");
  });
});
