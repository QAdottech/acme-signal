import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { codexEstimate } from "./usage.mjs";

const rateSchema = z.object({ model: z.string().min(1), effectiveDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  inputUsdPerMillion: z.number().nonnegative(), cachedInputUsdPerMillion: z.number().nonnegative(), outputUsdPerMillion: z.number().nonnegative() });
const readJson = file => JSON.parse(readFileSync(file, "utf8"));
const safe = value => String(value ?? "unknown").replace(/[\n\r|<>]/g, " ").slice(0, 160);
const display = value => value === null || value === undefined || value === "unknown" ? "unknown" : String(value);

/** @param {{model: string, effectiveDate: string, inputUsdPerMillion: number, cachedInputUsdPerMillion: number, outputUsdPerMillion: number} | null} [rates] */
export function runMetrics(manifest, pr, rates = null) {
  const agent = manifest?.agent ?? "unknown";
  const model = manifest?.requestedModel ?? "unknown";
  const tokens = manifest?.metrics?.tokenUsage;
  const usage = tokens && typeof tokens === "object" && !Array.isArray(tokens) ? tokens : null;
  const cliCost = agent === "claude" && typeof manifest?.metrics?.cost === "number" && Number.isFinite(manifest.metrics.cost) ? manifest.metrics.cost : null;
  const estimated = agent === "codex" ? codexEstimate(usage, rates, model) : null;
  return {
    schemaVersion: 1, pr, agent, model, runId: manifest?.runId ?? "unknown",
    githubRunId: process.env.GITHUB_RUN_ID ?? null, createdAt: manifest?.createdAt ?? null,
    cliVersions: manifest?.versions ?? null,
    revision: manifest?.targetRevision ?? "unknown", inputHash: manifest?.inputHash ?? "unknown",
    status: manifest?.status ?? "blocked", terminationReason: manifest?.terminationReason ?? "missing-manifest",
    runtimeMs: manifest?.metrics?.runtimeMs ?? null, tokens: usage, browserActionCount: manifest?.metrics?.browserActionCount ?? null,
    cost: {
      usd: cliCost ?? estimated,
      source: cliCost !== null ? "claude-cli-reported" : estimated !== null ? "rate-card-estimate" : "unknown",
      billedAmountKnown: false,
      rateCard: estimated !== null ? rates : null,
    },
  };
}

export function comparisonTable(metrics) {
  const rows = ["| Agent | Model | Revision | Status | Input | Cached input | Output | Total | USD | Cost basis | Runtime (ms) |",
    "| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |"];
  for (const item of metrics) rows.push(`| ${safe(item.agent)} | ${safe(item.model)} | ${safe(item.revision)} | ${safe(item.status)} | ${display(item.tokens?.input)} | ${display(item.tokens?.cachedInput)} | ${display(item.tokens?.output)} | ${display(item.tokens?.total)} | ${display(item.cost.usd)} | ${safe(item.cost.source)} | ${display(item.runtimeMs)} |`);
  return rows.join("\n") + "\n\nCosts are CLI-reported or rate-card estimates, **not invoices**. Unknown is not zero. Review findings and evidence separately; no result is an automatic QA pass.\n";
}

function saveSummary(text) {
  if (process.env.GITHUB_STEP_SUMMARY) writeFileSync(process.env.GITHUB_STEP_SUMMARY, text, { flag: "a" });
  console.log(text);
}

export function main(argv = process.argv.slice(2)) {
  if (argv[0] === "run" && argv.length >= 3 && argv.length <= 4) {
    const [, parentPath, rawPr, ratesPath] = argv;
    const pr = z.coerce.number().int().positive().parse(rawPr);
    const parent = resolve(parentPath);
    const runs = existsSync(parent) ? readdirSync(parent, { withFileTypes: true }).filter(item => item.isDirectory()) : [];
    // One runner invocation per CI job; refuse ambiguous directories.
    const dir = runs.length === 1 ? join(parent, runs[0].name) : join(parent, "missing-run");
    mkdirSync(dir, { recursive: true });
    let manifest = null;
    try { manifest = readJson(join(dir, "manifest.json")); } catch { /* Missing/malformed result is blocked, not success. */ }
    const rates = ratesPath && existsSync(ratesPath) ? rateSchema.parse(readJson(ratesPath)) : null;
    const metrics = runMetrics(manifest, pr, rates);
    writeFileSync(join(dir, "metrics.json"), JSON.stringify(metrics, null, 2) + "\n");
    saveSummary(`### PR #${pr} exploratory QA\n${comparisonTable([metrics])}`);
    return;
  }
  if (argv[0] === "compare" && argv.length === 3) {
    const pr = z.coerce.number().int().positive().parse(argv[2]);
    const parent = resolve(argv[1]);
    const metrics = [];
    for (const agent of ["claude", "codex"]) {
      const dir = join(parent, `qa-metrics-${agent}`);
      const files = existsSync(dir) ? readdirSync(dir, { recursive: true }) : [];
      const matching = files.filter(file => String(file).endsWith("metrics.json"));
      if (matching.length === 1) {
        try { metrics.push(readJson(join(dir, matching[0]))); continue; } catch { /* Report unknown, never success. */ }
      }
      metrics.push(runMetrics({ agent, status: "blocked", terminationReason: "missing-metrics" }, pr));
    }
    saveSummary(`### PR #${pr}: Claude / Codex run metrics\n${comparisonTable(metrics)}`);
    return;
  }
  throw new Error("Usage: node metrics.mjs run RUN_PARENT PR_NUMBER [RATE_CARD_JSON] | compare DOWNLOADED_ARTIFACTS PR_NUMBER");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
