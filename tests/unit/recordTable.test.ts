import { describe, expect, it } from "vitest";
import { sortRows, type Column } from "@/components/record-table/record-table";
import { facetOptions, countFilters } from "@/components/record-table/toolbar";
import { withStage } from "@/lib/dealData";
import type { Deal } from "@/types/deal";

type Row = { name: string; value: number };
const columns: Column<Row>[] = [
  { id: "name", header: "Name", sortValue: (r) => r.name, cell: (r) => r.name },
  { id: "value", header: "Value", sortValue: (r) => r.value, cell: (r) => r.value },
  { id: "plain", header: "Plain", cell: () => null },
];
const rows: Row[] = [
  { name: "Deal 10", value: 5 },
  { name: "Deal 2", value: 50 },
  { name: "deal 1", value: 500 },
];

describe("record table sorting", () => {
  it("sorts text naturally and case-insensitively", () => {
    expect(sortRows(rows, columns, { columnId: "name", direction: "asc" }).map((r) => r.name)).toEqual([
      "deal 1",
      "Deal 2",
      "Deal 10",
    ]);
  });

  it("sorts numbers numerically in both directions", () => {
    expect(sortRows(rows, columns, { columnId: "value", direction: "desc" }).map((r) => r.value)).toEqual([500, 50, 5]);
    expect(sortRows(rows, columns, { columnId: "value", direction: "asc" }).map((r) => r.value)).toEqual([5, 50, 500]);
  });

  it("leaves order alone for unsortable or unknown columns", () => {
    expect(sortRows(rows, columns, { columnId: "plain", direction: "asc" })).toEqual(rows);
    expect(sortRows(rows, columns, { columnId: "missing", direction: "asc" })).toEqual(rows);
  });
});

describe("filter helpers", () => {
  it("builds unique sorted options and counts active filters", () => {
    expect(facetOptions(["Stockholm", undefined, "Austin", "Stockholm", ""])).toEqual(["Austin", "Stockholm"]);
    expect(countFilters({ stage: ["Lead", "New"], owner: [], industry: ["AI"] })).toBe(3);
  });
});

describe("withStage", () => {
  const deal = { id: "d", stage: "Lead", probability: 22 } as Deal;

  it("moves the deal and applies the stage's default probability", () => {
    expect(withStage(deal, "Qualified")).toMatchObject({ stage: "Qualified", probability: 30 });
    expect(withStage(deal, "Customer")).toMatchObject({ stage: "Customer", probability: 100 });
  });

  it("keeps the current probability for stages without a default", () => {
    expect(withStage(deal, "Churned")).toMatchObject({ stage: "Churned", probability: 22 });
  });
});
