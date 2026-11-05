import { afterEach, describe, expect, it } from "vitest";
import { applyDemoUrlParams } from "@/lib/demo-url";
import { getEnabledDemoBugs } from "@/lib/demo-bugs";

function visit(path: string) {
  window.history.replaceState(null, "", path);
  return applyDemoUrlParams();
}

describe("demo URL params", () => {
  afterEach(() => window.history.replaceState(null, "", "/"));

  it("does nothing without demo params", () => {
    localStorage.setItem("deals", "[\"kept\"]");
    expect(visit("/deals?view=board")).toBe(false);
    expect(localStorage.getItem("deals")).toBe("[\"kept\"]");
    expect(window.location.search).toBe("?view=board");
  });

  it("resets data, sets bugs, and removes both params so a reload can't repeat them", () => {
    localStorage.setItem("deals", "[\"edited\"]");
    expect(visit("/deals?resetDemo=1&demoBugs=value-rounding&view=board")).toBe(true);
    expect(localStorage.getItem("deals")).toBeNull();
    expect(getEnabledDemoBugs()).toEqual(["value-rounding"]);
    expect(window.location.pathname).toBe("/deals");
    expect(window.location.search).toBe("?view=board&reset=1");
    expect(visit(window.location.pathname + window.location.search)).toBe(false);
  });

  it("treats resetDemo=0 as no reset", () => {
    localStorage.setItem("deals", "[\"edited\"]");
    expect(visit("/?resetDemo=0")).toBe(true);
    expect(localStorage.getItem("deals")).toBe("[\"edited\"]");
    expect(window.location.search).toBe("");
  });
});
