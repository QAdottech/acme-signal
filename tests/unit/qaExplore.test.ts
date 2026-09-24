// @vitest-environment node
import { afterEach, describe, expect, test } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { adapter, agentEnvironment, inspectRuntime } from "../agent-browser/runner/adapters.mjs";
import { parseOptions, composeTask, executionOutcome, browserActionCount, supportedCliVersion } from "../agent-browser/runner/explore.mjs";
import { artifactPath, checkBrowserArgs } from "../agent-browser/runner/browser-command.mjs";
import { runProcess } from "../agent-browser/runner/process.mjs";
import { usageFromEvents, codexEstimate } from "../agent-browser/runner/usage.mjs";

const directories: string[] = [];
function temporaryDirectory() {
  const dir = mkdtempSync(join(tmpdir(), "qa-explore-test-"));
  directories.push(dir);
  return dir;
}
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }); });
const args = ["--agent", "claude", "--model", "test-model", "--url", "http://localhost:3100", "--revision", "test-sha", "--charter", "charter.md"];

describe("exploration task boundary", () => {
  test("defaults to preparation without inference", () => {
    expect(parseOptions(args)).toMatchObject({ execute: false, seconds: 600 });
    expect(parseOptions(["--", ...args])).toEqual(parseOptions(args));
  });
  test("rejects invalid budgets, targets, agents, unknown flags and unapproved execution", () => {
    for (const extra of [["--seconds", "0"], ["--seconds", "NaN"], ["--url", "http://127.0.0.1:3100"], ["--url", "https://user:password@example.test"], ["--agent", "other"], ["--unknown"], ["--execute"]]) {
      expect(() => parseOptions([...args, ...extra])).toThrow();
    }
    expect(parseOptions([...args, "--execute", "--confirm-safe-target"])).toMatchObject({ execute: true });
  });
  test("same supplied inputs produce the same task without prior agent findings", () => {
    const inputs = { skill: "UI-only", contract: "synthetic data", charter: "Explore contacts", context: "PR changes filtering" };
    expect(composeTask(inputs)).toEqual(composeTask(inputs));
    expect(composeTask(inputs)).toContain("PR changes filtering");
    expect(composeTask(inputs)).toContain("untrusted data");
  });
});

describe("runtime adapters", () => {
  test("allows newer Claude 2.1 patch releases but rejects older, malformed and new minor versions", () => {
    expect(supportedCliVersion("claude", "2.1.280 (Claude Code)")).toBe(true);
    expect(supportedCliVersion("claude", "2.1.281 (Claude Code)")).toBe(true);
    expect(supportedCliVersion("claude", "2.1.279 (Claude Code)")).toBe(false);
    expect(supportedCliVersion("claude", "2.2.0 (Claude Code)")).toBe(false);
    expect(supportedCliVersion("claude", "unknown")).toBe(false);
    expect(supportedCliVersion("claude", "2.1.281 (unrelated CLI)")).toBe(false);
  });
  test("keeps Codex pinned exactly", () => {
    expect(supportedCliVersion("codex", "codex-cli 0.147.0")).toBe(true);
    expect(supportedCliVersion("codex", "codex-cli 0.147.1")).toBe(false);
  });
  test("Claude uses print/stream mode with constrained tools, not permission bypass", () => {
    const invocation = adapter("claude", "test-model");
    expect(invocation.command).toBe("claude");
    expect(invocation.args).toContain("--print");
    expect(invocation.args).toContain("dontAsk");
    // Claude checks Write tool requests against Edit(path) permissions, not Write(path).
    expect(invocation.args).toContain("Edit(./report.md)");
    expect(invocation.args).toContain("Edit(./artifacts/**)");
    expect(invocation.args).not.toContain("Write(./report.md)");
    expect(invocation.args.join(" ")).not.toMatch(/bypass|--resume|--continue/);
  });
  test("Codex uses ephemeral workspace-write and never asks for escalation", () => {
    const invocation = adapter("codex", "test-model");
    expect(invocation.args).toContain("--ephemeral");
    expect(invocation.args).toContain("workspace-write");
    expect(invocation.args).toContain("never");
    expect(invocation.args.join(" ")).not.toMatch(/bypass|danger-full-access|resume/);
  });
  test("environment excludes application secrets and cross-agent credentials", () => {
    const env = agentEnvironment({ PATH: "/bin", HOME: "/home/test", RESEND_API_KEY: "fake", ANTHROPIC_API_KEY: "fake-claude", OPENAI_API_KEY: "fake-codex", AGENT_BROWSER_PROFILE: "Default" }, "claude", "/qa/bin");
    expect(env.PATH).toBe("/qa/bin:/bin");
    expect(env.ANTHROPIC_API_KEY).toBe("fake-claude");
    expect(env).not.toHaveProperty("OPENAI_API_KEY");
    expect(env).not.toHaveProperty("RESEND_API_KEY");
    expect(env).not.toHaveProperty("AGENT_BROWSER_PROFILE");
  });
});

describe("runtime completion evidence", () => {
  test("counts started UI actions but not snapshots or failed log lines", () => {
    const log = [
      { event: "started", kind: "browser-action" },
      { event: "finished", kind: "browser-action" },
      { event: "started", kind: "observation-or-navigation" },
    ].map(event => JSON.stringify(event)).join("\n");
    expect(browserActionCount(log)).toBe(1);
    expect(browserActionCount("malformed")).toBe("unknown");
  });
  test("accepts native successful terminal events and retains usage", () => {
    expect(inspectRuntime(' {"type":"result","subtype":"success","is_error":false,"total_cost_usd":0.12,"usage":{"input_tokens":10}}\n', "claude")).toMatchObject({ ok: true, cost: 0.12 });
    expect(inspectRuntime('{"type":"turn.completed","usage":{"input_tokens":20,"output_tokens":5}}\n', "codex")).toMatchObject({ ok: true, cost: "unknown" });
  });
  test("rejects missing, malformed and failed terminal events despite process exit zero", () => {
    expect(inspectRuntime("", "claude").ok).toBe(false);
    expect(inspectRuntime("not json", "codex").ok).toBe(false);
    expect(inspectRuntime('{"type":"turn.failed"}', "codex").ok).toBe(false);
    expect(inspectRuntime('{"type":"result","subtype":"error_max_turns","is_error":true}', "claude").ok).toBe(false);
  });
});

describe("usage and cost provenance", () => {
  test("Claude separates cached tokens and reports CLI cost, not a billed invoice", () => {
    const result = usageFromEvents(JSON.stringify({ type: "result", subtype: "success", is_error: false,
      usage: { input_tokens: 20, cache_read_input_tokens: 50, cache_creation_input_tokens: 5, output_tokens: 10 }, total_cost_usd: 0.01 }), "claude");
    expect(result).toMatchObject({ completed: true, tokens: { total: 85, cachedInput: 50 }, costUsd: 0.01, source: "claude-cli-reported" });
  });
  test("Codex cached tokens are a subset of input, with cost unknown unless priced", () => {
    const result = usageFromEvents(JSON.stringify({ type: "turn.completed", usage: { input_tokens: 200, cached_input_tokens: 100, output_tokens: 50 } }), "codex");
    expect(result).toMatchObject({ completed: true, tokens: { total: 250, cachedInput: 100 }, costUsd: null });
    expect(codexEstimate(result.tokens, { model: "gpt-example", effectiveDate: "2026-09-01", inputUsdPerMillion: 2, cachedInputUsdPerMillion: 1, outputUsdPerMillion: 8 }, "gpt-example")).toBe(0.0007);
  });
  test("does not fabricate absent tokens, costs or partial-run totals", () => {
    expect(usageFromEvents("", "claude").tokens).toBeNull();
    expect(usageFromEvents("broken JSON", "codex").costUsd).toBeNull();
    expect(usageFromEvents(JSON.stringify({ type: "turn.completed", usage: { input_tokens: 20, output_tokens: 3 } }), "codex").tokens).toMatchObject({ cachedInput: null, total: 23 });
    expect(codexEstimate({ input: 10, cachedInput: null, output: 2 }, { model: "test", effectiveDate: "2026-09-01", inputUsdPerMillion: 1, cachedInputUsdPerMillion: 1, outputUsdPerMillion: 1 }, "test")).toBeNull();
  });
});

describe("browser wrapper", () => {
  test("permits genuine pointer input and captured request inspection", () => {
    expect(checkBrowserArgs(["mouse", "move", "100", "200"], "http://localhost:3100")).toBeNull();
    expect(checkBrowserArgs(["network", "request", "123"], "http://localhost:3100")).toBeNull();
  });
  test("rejects storage, script execution, session overrides and foreign targets", () => {
    for (const command of [["storage", "local"], ["eval", "document.title"], ["close", "--all"], ["click", "@e1", "--profile", "Default"], ["network", "route", "**"], ["open", "https://example.test"]]) {
      expect(checkBrowserArgs(command, "http://localhost:3100")).not.toBeNull();
    }
  });
  test("rejects artifact traversal and symlink escapes", () => {
    const workspace = temporaryDirectory();
    const outside = temporaryDirectory();
    mkdirSync(join(workspace, "artifacts"));
    symlinkSync(outside, join(workspace, "artifacts/link"));
    expect(artifactPath("artifacts/screen.png", workspace)).toBe(join(workspace, "artifacts/screen.png"));
    expect(() => artifactPath("../outside.png", workspace)).toThrow();
    expect(() => artifactPath("artifacts/link/screen.png", workspace)).toThrow();
  });
});

describe("lifecycle and non-passing infrastructure outcomes", () => {
  async function child(script: string, timeoutMs = 2000, signal = new AbortController().signal) {
    const cwd = temporaryDirectory();
    const stdout = join(cwd, "stdout.log");
    const stderr = join(cwd, "stderr.log");
    const result = await runProcess({ command: process.execPath, args: ["-e", script], cwd, env: process.env, timeoutMs, stdout, stderr, signal, graceMs: 50 });
    return { result, output: readFileSync(stdout, "utf8") };
  }
  test("successful execution retains partial logs and still requires evidence review", async () => {
    const { result, output } = await child("console.log('artifact')");
    expect(output).toContain("artifact");
    expect(executionOutcome(result, true, true)).toMatchObject({ status: "review-required" });
    expect(executionOutcome(result, false, true)).toMatchObject({ status: "blocked" });
  });
  test("crashes cannot become passing results even with an existing report", async () => {
    const { result } = await child("process.exit(3)");
    expect(executionOutcome(result, true, true)).toMatchObject({ status: "blocked", terminationReason: "agent-error" });
  });
  test("timeout terminates a resistant child and preserves output", async () => {
    const { result, output } = await child("console.log('partial'); process.on('SIGTERM', () => {}); setInterval(() => {}, 1000)", 500);
    expect(output).toContain("partial");
    expect(result.runtimeMs).toBeLessThan(2000);
    expect(executionOutcome(result, true, true)).toMatchObject({ status: "blocked", terminationReason: "timeout" });
  });
  test("abort stops the child", async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 100);
    try {
      const { result } = await child("setInterval(() => {}, 1000)", 2000, controller.signal);
      expect(result.reason).toBe("interrupted");
    } finally { clearTimeout(timer); }
  });
  test("missing executable is an infrastructure failure", async () => {
    const cwd = temporaryDirectory();
    const result = await runProcess({ command: join(cwd, "absent"), args: [], cwd, env: process.env, timeoutMs: 1000, stdout: join(cwd, "stdout"), stderr: join(cwd, "stderr"), graceMs: 50 });
    expect(result.reason).toBe("spawn-error");
    expect(executionOutcome(result, true, true).status).toBe("blocked");
  });
});
