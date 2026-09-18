#!/usr/bin/env node
import { appendFileSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";

const commands = new Set([
  "open", "back", "forward", "reload", "snapshot", "click", "dblclick", "type", "fill",
  "press", "keyboard", "hover", "focus", "check", "uncheck", "select", "drag", "scroll",
  "scrollintoview", "wait", "screenshot", "download", "get", "is", "find", "mouse",
  "dialog", "frame", "console", "errors", "network", "skills", "--help", "--version",
]);
const flags = new Set(["--help", "--version", "--json", "--full", "--annotate", "--interactive", "--compact", "--depth", "--selector", "--name", "--exact", "--text", "--url", "--load", "--filter", "--type", "--method", "--status"]);
const interactionCommands = new Set(["open", "back", "forward", "reload", "click", "dblclick", "type", "fill", "press", "keyboard", "hover", "focus", "check", "uncheck", "select", "drag", "download", "scroll", "scrollintoview", "mouse", "dialog"]);

export function checkBrowserArgs(args, targetUrl) {
  if (!commands.has(args[0])) return "Command is not approved for UI-only testing; read task.md.";
  if (args.some(arg => ["-p", "--provider", "--config"].includes(arg) || (arg.startsWith("--") && !flags.has(arg)))) return "Session, launch, state, routing and arbitrary-evaluation flags are not allowed.";
  if (args[0] === "network" && !["requests", "request", "--help"].includes(args[1])) return "Only captured network inspection is allowed; the runner owns HAR recording.";
  if (args[0] === "get" && !["text", "value", "attr", "title", "url", "count", "box", "styles", "--help"].includes(args[1])) return "Read rendered UI, not hidden state or browser endpoints.";
  if (args[0] === "skills" && args.join(" ") !== "skills get core") return "Use the pinned core skill; other skill collections are not needed.";
  if (args[0] === "open" && !args.includes("--help")) {
    try { if (new URL(args[1]).origin !== new URL(targetUrl).origin) return "Only the approved target origin may be opened directly."; }
    catch { return "open requires an absolute target URL."; }
  }
  return null;
}

export function artifactPath(path, workspace) {
  const root = realpathSync(resolve(workspace, "artifacts"));
  const candidate = resolve(workspace, path);
  const parent = realpathSync(dirname(candidate));
  const within = (base, value) => {
    const rel = relative(base, value);
    return rel !== ".." && !rel.startsWith("../") && !isAbsolute(rel);
  };
  if (!within(resolve(workspace, "artifacts"), candidate) || !within(root, parent)) throw new Error("Save evidence inside artifacts/; parent directories must already exist.");
  // Existing symlinks must not redirect output outside the artifact directory.
  try { if (!within(root, realpathSync(candidate))) throw new Error("Evidence path points outside artifacts/."); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  return candidate;
}

function main() {
  const workspace = resolve(dirname(fileURLToPath(import.meta.url)), "..");
  const config = JSON.parse(readFileSync(resolve(workspace, "browser.json"), "utf8"));
  const args = process.argv.slice(2);
  const issue = checkBrowserArgs(args, config.targetUrl);
  if (issue) throw new Error(issue);
  if (Date.now() >= config.deadline) throw new Error("Execution budget expired; preserve your observations and stop.");
  const id = randomUUID();
  if (args[0] === "screenshot" && !args.includes("--help")) {
    let index = args.findIndex((arg, i) => i > 0 && !arg.startsWith("-"));
    if (index < 0) { args.push(`artifacts/${id}.png`); index = args.length - 1; }
    args[index] = artifactPath(args[index], workspace);
  }
  if (args[0] === "download" && !args.includes("--help")) args[2] = artifactPath(args[2], workspace);
  const log = resolve(workspace, "artifacts/actions.jsonl");
  appendFileSync(log, JSON.stringify({ id, at: new Date().toISOString(), args, event: "started", kind: interactionCommands.has(args[0]) ? "browser-action" : "observation-or-navigation" }) + "\n");
  const result = spawnSync(config.binary, ["--config", config.configFile, "--session", config.session, ...args], {
    cwd: workspace, env: config.env, encoding: "utf8", timeout: Math.min(30_000, Math.max(1, config.deadline - Date.now())), maxBuffer: 10 * 1024 * 1024,
  });
  const output = `${result.stdout ?? ""}${result.stderr ?? ""}${result.error?.message ?? ""}`;
  writeFileSync(resolve(workspace, `artifacts/${id}.txt`), output);
  appendFileSync(log, JSON.stringify({ id, at: new Date().toISOString(), event: "finished", code: result.status, evidence: `artifacts/${id}.txt` }) + "\n");
  process.stdout.write(output);
  process.exitCode = result.status === 0 ? 0 : 1;
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); }
  catch (error) { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; }
}
