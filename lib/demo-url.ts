import { resetDemoData } from "@/lib/demo-data";
import { applyDemoBugsFromUrl } from "@/lib/demo-bugs";

/**
 * Demo setup from the URL, so one link (or an agent's start URL) defines a
 * whole scenario:
 *
 *   /?resetDemo=1                         fresh seed data
 *   /?demoBugs=value-rounding,stale-probability
 *   /deals?resetDemo=1&demoBugs=all
 *
 * The params are applied once and then removed from the address bar, so a
 * reload (or an agent re-checking persistence) doesn't reset data again.
 * Returns true when it changed something.
 */
export function applyDemoUrlParams(): boolean {
  if (typeof window === "undefined") return false;
  const url = new URL(window.location.href);
  const reset = url.searchParams.get("resetDemo");
  const bugs = url.searchParams.get("demoBugs");
  if (reset === null && bugs === null) return false;

  if (reset !== null && reset !== "0" && reset !== "false") {
    resetDemoData();
    url.searchParams.set("reset", "1"); // AppShell shows a "Demo data reset" toast
  }
  applyDemoBugsFromUrl();

  url.searchParams.delete("resetDemo");
  url.searchParams.delete("demoBugs");
  window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  return true;
}
