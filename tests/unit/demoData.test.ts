import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  SEEDED_STORAGE_KEYS,
  SEED_VERSION,
  ensureCurrentSeedData,
  resetDemoData,
  seedDate,
} from "@/lib/demo-data";

describe("demo seed data", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 3, 9, 0, 0)); // Nov 3, 2026 local
  });
  afterEach(() => vi.useRealTimers());

  it("keeps authored dates at the same distance from today", () => {
    // Authored against Feb 26, 2026.
    expect(seedDate("2026-02-26")).toBe("2026-11-03");
    expect(seedDate("2026-02-20")).toBe("2026-10-28");
    expect(seedDate("2026-03-05")).toBe("2026-11-10");
  });

  it("re-seeds stale caches once, then leaves user edits alone", () => {
    localStorage.setItem("deals", "[\"stale\"]");
    localStorage.setItem("user", "{\"id\":\"1\"}");
    ensureCurrentSeedData();
    expect(localStorage.getItem("deals")).toBeNull();
    expect(localStorage.getItem("user")).not.toBeNull();
    expect(localStorage.getItem("acme-seed-version")).toBe(SEED_VERSION);

    localStorage.setItem("deals", "[\"edited\"]");
    ensureCurrentSeedData();
    expect(localStorage.getItem("deals")).toBe("[\"edited\"]");
  });

  it("reset clears every seeded collection", () => {
    for (const key of SEEDED_STORAGE_KEYS) localStorage.setItem(key, "[]");
    resetDemoData();
    for (const key of SEEDED_STORAGE_KEYS) expect(localStorage.getItem(key)).toBeNull();
  });
});
