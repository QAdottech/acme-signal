/**
 * Deliberate, switchable bugs for QA.tech demos.
 *
 * The app is meant to be clean by default. A presenter turns on one or more
 * of these (Settings → Demo bugs, or `?demoBugs=id1,id2` on any URL) so the
 * agents have a specific, believable defect to find. Every bug is off unless
 * explicitly enabled, and each call site is marked `DEMO BUG: <id>`.
 */

export interface DemoBug {
  id: string;
  title: string;
  /** Where in the app it shows up. */
  area: string;
  /** What a tester would notice. */
  symptom: string;
}

export const DEMO_BUGS = [
  {
    id: "value-rounding",
    title: "Deal values round down",
    area: "Deals table, board cards, record pages",
    symptom: "Deals under $1M display rounded down to the nearest $10K (a $45K deal shows $40K), so rows no longer add up to the totals.",
  },
  {
    id: "stale-probability",
    title: "Stage changes keep the old probability",
    area: "Deals table, board drag, deal page",
    symptom: "Moving a deal to a new stage leaves its probability (and weighted value) at the previous stage's number.",
  },
  {
    id: "search-drops-last",
    title: "Search hides the last match",
    area: "Companies, People and Deals search",
    symptom: "Searching leaves out one of the matching records, so the count is one short; a search with exactly one match shows nothing.",
  },
  {
    id: "notes-not-saved",
    title: "New notes are lost on reload",
    area: "Notes on company, person and deal pages",
    symptom: "A new note appears immediately but is gone after refreshing the page.",
  },
  {
    id: "due-today-overdue",
    title: "Tasks due today count as overdue",
    area: "Tasks page, sidebar task count",
    symptom: "A task due today is marked overdue and listed under the Overdue tab.",
  },
  {
    id: "bulk-delete-wrong-row",
    title: "Bulk delete removes the wrong deal",
    area: "Deals table selection bar",
    symptom: "Deleting selected deals removes the row below each selected one instead.",
  },
  {
    id: "export-skips-first-row",
    title: "CSV export drops the first row",
    area: "Export CSV on Companies, People and Deals",
    symptom: "The downloaded CSV is missing the first record that was on screen.",
  },
  {
    id: "pipeline-total-mismatch",
    title: "Pipeline total ignores New deals",
    area: "Sales Pipeline header",
    symptom: "The board's total value leaves out deals in the New column, so it disagrees with the Deals table.",
  },
] as const satisfies readonly DemoBug[];

export type DemoBugId = (typeof DEMO_BUGS)[number]["id"];

const STORAGE_KEY = "acme-demo-bugs";
const ALL_IDS = DEMO_BUGS.map((bug) => bug.id) as DemoBugId[];

export function getEnabledDemoBugs(): DemoBugId[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((id): id is DemoBugId => ALL_IDS.includes(id)) : [];
  } catch {
    return [];
  }
}

export function setEnabledDemoBugs(ids: DemoBugId[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  window.dispatchEvent(new Event("demo-bugs-updated"));
}

/** True when the presenter has switched this bug on. Always false on the server. */
export function isDemoBugEnabled(id: DemoBugId): boolean {
  return getEnabledDemoBugs().includes(id);
}

/**
 * Apply `?demoBugs=` from the URL: a comma-separated list of ids, `all`, or
 * `none`. Lets a demo link or an agent's start URL set up the scenario.
 */
export function applyDemoBugsFromUrl(): void {
  if (typeof window === "undefined") return;
  const param = new URLSearchParams(window.location.search).get("demoBugs");
  if (param === null) return;
  if (param === "none" || param === "") setEnabledDemoBugs([]);
  else if (param === "all") setEnabledDemoBugs(ALL_IDS);
  else setEnabledDemoBugs(param.split(",").map((id) => id.trim()).filter((id): id is DemoBugId => ALL_IDS.includes(id as DemoBugId)));
}

/** DEMO BUG: search-drops-last — searching hides the final matching row. */
export function applySearchBug<T>(rows: T[], searchTerm: string): T[] {
  if (!searchTerm.trim() || !isDemoBugEnabled("search-drops-last")) return rows;
  return rows.slice(0, -1);
}
