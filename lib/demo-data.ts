/**
 * Demo data helpers.
 *
 * The seed records were written around SEED_ANCHOR. `seedDate` shifts each
 * authored date by however long it has been since then, so "last contacted
 * 6 days ago" or "closes in 7 weeks" stays true whenever the demo runs.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/** The "today" the seed data was written against. */
const SEED_ANCHOR = new Date(2026, 1, 26); // Feb 26, 2026 (local)

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Shift an authored `YYYY-MM-DD` seed date so it stays relative to today. */
export function seedDate(authored: string): string {
  const [y, m, d] = authored.split("-").map(Number);
  const authoredDate = new Date(y, m - 1, d);
  const offsetDays = Math.round(
    (authoredDate.getTime() - SEED_ANCHOR.getTime()) / DAY_MS
  );
  return toISODate(new Date(startOfToday().getTime() + offsetDays * DAY_MS));
}

/**
 * localStorage keys holding seeded CRM records. Auth (`user`, `users`) and
 * custom reports are left alone.
 */
export const SEEDED_STORAGE_KEYS = [
  "deals",
  "organizations",
  "collections",
  "people",
  "notes",
  "emails",
  "activities",
  "tasks",
] as const;

/**
 * Bump when the seed data changes shape or content, so browsers that cached
 * an older copy pick up the new one on their next visit.
 */
export const SEED_VERSION = "3";
const SEED_VERSION_KEY = "acme-seed-version";

/** Clear cached CRM records so every getter re-seeds from defaults. */
export function resetDemoData(): void {
  for (const key of SEEDED_STORAGE_KEYS) localStorage.removeItem(key);
  localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
}

/** Re-seed once if the cached data predates the current SEED_VERSION. */
export function ensureCurrentSeedData(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(SEED_VERSION_KEY) !== SEED_VERSION) {
      resetDemoData();
    }
  } catch {
    // Storage unavailable (private mode etc.) — defaults are used anyway.
  }
}

/** ISO timestamp `days` (and `hours`) before now — for seeded activity. */
export function daysAgo(days: number, hours = 0): string {
  return new Date(Date.now() - (days * 24 + hours) * 60 * 60 * 1000).toISOString();
}

/** Plain `YYYY-MM-DD` date `days` from today (negative = in the past). */
export function inDays(days: number): string {
  return toISODate(new Date(startOfToday().getTime() + days * DAY_MS));
}
