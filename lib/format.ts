/**
 * Shared date formatting. Every date the UI shows should go through these
 * helpers so the app uses one format everywhere.
 */

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Parse an ISO timestamp or a plain `YYYY-MM-DD` date. Plain dates are read
 * as local calendar dates (new Date("2026-04-15") would be UTC midnight and
 * can show as the previous day in American time zones).
 */
export function parseDate(value: string | Date): Date {
  if (value instanceof Date) return value;
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (plain) {
    return new Date(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3]));
  }
  return new Date(value);
}

/** "Apr 15" in the current year, "Apr 15, 2027" otherwise. */
export function formatDate(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  const sameYear = date.getFullYear() === new Date().getFullYear();
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });
}

/** Always includes the year: "Apr 15, 2026". */
export function formatFullDate(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "just now", "5m ago", "3h ago", "2d ago", "3w ago", then a date. */
export function formatRelative(value: string | Date | undefined | null): string {
  if (!value) return "—";
  const date = parseDate(value);
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return "—";
  if (diff < 0) return formatDate(date);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(diff / DAY_MS);
  if (days < 7) return `${days}d ago`;
  if (days < 28) return `${Math.floor(days / 7)}w ago`;
  return formatDate(date);
}
