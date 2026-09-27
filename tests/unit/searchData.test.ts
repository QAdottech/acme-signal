import { beforeEach, describe, expect, it } from "vitest";
import { searchRecords } from "@/lib/searchData";

beforeEach(() => {
  localStorage.setItem("organizations", JSON.stringify([
    { id: "org-1", name: "Northwind", location: "Seattle", industry: "Retail" },
  ]));
  localStorage.setItem("people", JSON.stringify([
    { id: "person-1", name: "Alex North", email: "alex@example.com", organization: "Northwind", role: "CEO" },
  ]));
  localStorage.setItem("deals", JSON.stringify([
    { id: "deal-1", title: "Growth Plan", organizationId: "org-1", owner: "Alex North", stage: "Lead" },
  ]));
  localStorage.setItem("tasks", "[]");
  localStorage.setItem("notes", "[]");
  localStorage.setItem("collections", "[]");
});

describe("unified record search", () => {
  it("does not return the entire CRM for a blank query", () => {
    expect(searchRecords("  ")).toEqual([]);
  });

  it("finds matching records across categories without case sensitivity", () => {
    expect(searchRecords("NORTH").map(({ category, label }) => ({ category, label }))).toEqual([
      { category: "Organizations", label: "Northwind" },
      { category: "People", label: "Alex North" },
      { category: "Deals", label: "Growth Plan" },
    ]);
  });

  it("searches a deal by its title", () => {
    expect(searchRecords("growth")).toMatchObject([
      { category: "Deals", label: "Growth Plan" },
    ]);
  });
});
