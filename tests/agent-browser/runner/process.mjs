import { spawn } from "node:child_process";
import { openSync, closeSync } from "node:fs";

// POSIX process groups keep cancellation scoped to children of this invocation.
// Browser daemons detach themselves and are closed separately by session name.
export function runProcess({ command, args, cwd, env, input = "", timeoutMs, stdout, stderr, signal = new AbortController().signal, graceMs = 1000 }) {
  return new Promise((resolve) => {
    const started = Date.now();
    const out = openSync(stdout, "a", 0o600);
    const err = openSync(stderr, "a", 0o600);
    const child = spawn(command, args, { cwd, env, detached: true, stdio: ["pipe", out, err] });
    closeSync(out);
    closeSync(err);
    let reason = "exited";
    let escalation;
    const kill = (kind) => {
      if (!child.pid) return;
      try { process.kill(-child.pid, kind); }
      catch (error) { if (error.code !== "ESRCH") throw error; }
    };
    const stop = (why) => {
      if (reason !== "exited") return;
      reason = why;
      kill("SIGTERM");
      escalation = setTimeout(() => kill("SIGKILL"), graceMs);
    };
    const abort = () => stop("interrupted");
    const timer = setTimeout(() => stop("timeout"), timeoutMs);
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) abort();
    child.stdin.on("error", () => { /* Early child exit is captured below, not a successful run. */ });
    child.stdin.end(input);
    let spawnError;
    child.on("error", (error) => { spawnError = error.message; });
    child.on("close", (code, exitSignal) => {
      clearTimeout(timer);
      // Kill any surviving descendants even if the shell leader exited first.
      kill("SIGKILL");
      clearTimeout(escalation);
      signal?.removeEventListener("abort", abort);
      resolve({ reason: spawnError ? "spawn-error" : reason, code, signal: exitSignal, error: spawnError ?? null, runtimeMs: Date.now() - started });
    });
  });
}
