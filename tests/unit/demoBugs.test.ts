import { afterEach, describe, expect, it } from "vitest";
import {
  applyDemoBugsFromUrl,
  applySearchBug,
  getEnabledDemoBugs,
  isDemoBugEnabled,
  setEnabledDemoBugs,
} from "@/lib/demo-bugs";
import { formatDealValue, withStage } from "@/lib/dealData";
import { resetDemoData } from "@/lib/demo-data";
import type { Deal } from "@/types/deal";

function visit(search: string) {
  window.history.replaceState(null, "", `/${search}`);
  applyDemoBugsFromUrl();
}

describe("demo bug switches", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("are all off by default", () => {
    expect(getEnabledDemoBugs()).toEqual([]);
    expect(formatDealValue(45000)).toBe("$45K");
    expect(withStage({ stage: "Lead", probability: 15 } as Deal, "Qualified").probability).toBe(30);
    expect(applySearchBug([1, 2, 3], "x")).toEqual([1, 2, 3]);
  });

  it("can be set from a URL: ids, all, none, ignoring unknown ids", () => {
    visit("?demoBugs=value-rounding,not-a-bug");
    expect(getEnabledDemoBugs()).toEqual(["value-rounding"]);
    visit("?demoBugs=all");
    expect(getEnabledDemoBugs()).toHaveLength(8);
    visit("?demoBugs=none");
    expect(getEnabledDemoBugs()).toEqual([]);
    visit("?other=1");
    expect(getEnabledDemoBugs()).toEqual([]);
  });

  it("change behaviour only while enabled", () => {
    setEnabledDemoBugs(["value-rounding", "stale-probability", "search-drops-last"]);
    expect(formatDealValue(45000)).toBe("$40K");
    expect(formatDealValue(1_250_000)).toBe("$1.3M");
    expect(withStage({ stage: "Lead", probability: 15 } as Deal, "Qualified").probability).toBe(15);
    expect(applySearchBug([1, 2, 3], "x")).toEqual([1, 2]);
    expect(applySearchBug([1, 2, 3], "")).toEqual([1, 2, 3]);
    expect(isDemoBugEnabled("notes-not-saved")).toBe(false);
  });

  it("survive a demo-data reset", () => {
    setEnabledDemoBugs(["value-rounding"]);
    resetDemoData();
    expect(getEnabledDemoBugs()).toEqual(["value-rounding"]);
  });
});
