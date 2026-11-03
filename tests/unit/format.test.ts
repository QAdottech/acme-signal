import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { formatDate, formatFullDate, formatRelative, parseDate } from "@/lib/format";

describe("date formatting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 12, 0, 0)); // Nov 3, 2026 local
  });
  afterEach(() => vi.useRealTimers());

  it("reads plain YYYY-MM-DD dates as local calendar days", () => {
    const date = parseDate("2026-04-15");
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 3, 15]);
  });

  it("omits the year only for the current year", () => {
    expect(formatDate("2026-04-15")).toBe("Apr 15");
    expect(formatDate("2027-01-05")).toBe("Jan 5, 2027");
    expect(formatFullDate("2026-04-15")).toBe("Apr 15, 2026");
  });

  it("returns a dash for missing or invalid dates", () => {
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("not a date")).toBe("—");
    expect(formatRelative(null)).toBe("—");
  });

  it("formats recent timestamps relatively and falls back to a date", () => {
    const ago = (ms: number) => new Date(Date.now() - ms).toISOString();
    expect(formatRelative(ago(10_000))).toBe("just now");
    expect(formatRelative(ago(5 * 60_000))).toBe("5m ago");
    expect(formatRelative(ago(3 * 3_600_000))).toBe("3h ago");
    expect(formatRelative(ago(2 * 86_400_000))).toBe("2d ago");
    expect(formatRelative(ago(15 * 86_400_000))).toBe("2w ago");
    expect(formatRelative(ago(60 * 86_400_000))).toBe("Sep 4");
  });
});
