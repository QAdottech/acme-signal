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

export function reportSections(report) {
  const sections = { scope: null, tested: null, untested: null, confirmed: null, suspected: null };
  let current = null;
  for (const line of report.split(/\r?\n/)) {
    if (/^##\s+/.test(line)) {
      const heading = line.replace(/^##\s+/, "").toLowerCase();
      current = heading.startsWith("environment and scope") ? "scope" :
        heading.startsWith("not tested") ? "untested" :
        heading.startsWith("tested") ? "tested" :
        heading.startsWith("confirmed defects") ? "confirmed" :
        heading.startsWith("suspected/intermittent issues") ? "suspected" : null;
      if (current !== null) sections[current] = "";
    } else if (current !== null && sections[current].length < 3500) {
      sections[current] += `${line}\n`;
    }
  }
  return Object.fromEntries(Object.entries(sections).map(([key, value]) => [key, value?.trim().slice(0, 3500) || null]));
}

const escapeHtml = text => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/@/g, "&#64;");
function reviewSummary(agent, sections, status) {
  const field = (heading, text) => `**${heading}**\n\n<pre>${escapeHtml(text ?? "Not recorded in the report.")}</pre>`;
  if (!sections) return `### ${agent}: no report available\n\nStatus: ${escapeHtml(safe(status))}. Coverage not reported by ${agent}; findings unknown.\n`;
  const coverage = sections.tested || sections.untested
    ? `${field("Tested (as reported)", sections.tested)}\n\n${field("Not tested (as reported)", sections.untested)}`
    : field("Coverage (tested and untested mixed in report)", sections.scope);
  return `### ${agent}: agent-reported exploration\n\nStatus: ${escapeHtml(safe(status))}. Findings are unverified; this is not a PR pass/fail verdict.\n\n${coverage}\n\n${field("Confirmed defects (as reported)", sections.confirmed)}\n\n${field("Suspected issues (as reported)", sections.suspected)}\n`;
}

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
    const reportPath = join(dir, "report.md");
    if (existsSync(reportPath)) writeFileSync(join(dir, "report-summary.json"), JSON.stringify(reportSections(readFileSync(reportPath, "utf8")), null, 2) + "\n");
    saveSummary(`### PR #${pr} exploratory QA\n${comparisonTable([metrics])}`);
    return;
  }
  if (argv[0] === "compare" && (argv.length === 3 || argv.length === 4)) {
    const pr = z.coerce.number().int().positive().parse(argv[2]);
    const parent = resolve(argv[1]);
    const metrics = [];
    const reviews = [];
    for (const agent of ["claude", "codex"]) {
      const dir = join(parent, `qa-metrics-${agent}`);
      const files = existsSync(dir) ? readdirSync(dir, { recursive: true }) : [];
      const matching = files.filter(file => String(file).endsWith("metrics.json"));
      let item = runMetrics({ agent, status: "blocked", terminationReason: "missing-metrics" }, pr);
      if (matching.length === 1) {
        try { item = readJson(join(dir, matching[0])); } catch { /* Report unknown, never success. */ }
      }
      metrics.push(item);
      const reports = files.filter(file => String(file).endsWith("report-summary.json"));
      let sections = null;
      if (reports.length === 1) {
        try {
          sections = z.object({ scope: z.string().nullable(), tested: z.string().nullable().default(null), untested: z.string().nullable().default(null), confirmed: z.string().nullable(), suspected: z.string().nullable() })
            .parse(readJson(join(dir, reports[0])));
        } catch { /* Missing/malformed report remains unknown. */ }
      }
      reviews.push(reviewSummary(agent, sections, item.status));
    }
    saveSummary(`### PR #${pr}: Claude / Codex run metrics\n${comparisonTable(metrics)}\n${reviews.join("\n")}`);
    if (argv[3]) {
      const runUrl = process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
        ? `https://github.com/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null;
      writeFileSync(argv[3], `<!-- acme-pr-exploratory-qa -->\n## Exploratory browser QA — human review required\n${runUrl ? `[Run and evidence](${runUrl}) · ` : ""}Revision: \`${safe(process.env.DEPLOYED_SHA ?? metrics[0]?.revision)}\`\n\n${reviews.join("\n")}\nAgent-reported observations are not an automatic QA pass. See the run artifacts for evidence.\n`);
    }
    return;
  }
  throw new Error("Usage: node metrics.mjs run RUN_PARENT PR_NUMBER [RATE_CARD_JSON] | compare DOWNLOADED_ARTIFACTS PR_NUMBER [COMMENT_FILE]");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(); } catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
