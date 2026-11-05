import { describe, expect, it } from "vitest";
import { createReportFromTemplate, deleteCustomReport, getCustomReports } from "@/lib/custom-reports";
import { getAllReports, getBuiltInReports, getReportById, queryDataSource } from "@/lib/reports";
import { saveDeals, withStage } from "@/lib/dealData";
import { saveOrganizations } from "@/lib/organizationData";
import type { Organization } from "@/types/organization";
import type { Deal } from "@/types/deal";

const deal: Deal = {
  id: "deal-a", title: "Pilot", organizationId: "company-a",
  value: 2000, currency: "USD", stage: "Lead", probability: 20,
  expectedCloseDate: "2026-07-01", owner: "Test owner", createdAt: "2026-06-01T00:00:00Z",
};

describe("custom reports", () => {
  it("creates a persistent report from a template, then deletes only that report", () => {
    const builtIn = getBuiltInReports();
    const report = createReportFromTemplate("pipeline-by-stage", "Sales review", "Weekly pipeline");
    const other = createReportFromTemplate("deals-by-owner", "Owner review", "By owner");

    expect(report).toMatchObject({
      title: "Sales review", description: "Weekly pipeline", isBuiltIn: false,
      widgets: [
        { type: "bar-chart", dataSource: "dealsByStage" },
        { type: "kpi-card", dataSource: "pipelineValueKpi" },
        { type: "kpi-card", dataSource: "totalDealsKpi" },
      ],
    });
    expect(getReportById(report.id)).toEqual(report);
    expect(getAllReports()).toEqual([...builtIn, report, other]);

    deleteCustomReport(report.id);
    expect(getReportById(report.id)).toBeUndefined();
    expect(getAllReports()).toEqual([...builtIn, other]);
  });

  it("rejects unknown templates without persisting a report", () => {
    expect(() => createReportFromTemplate("missing", "Title", "Description")).toThrow("Template not found");
    expect(getCustomReports()).toEqual([]);
  });
});

describe("report metrics", () => {
  it("reports open pipeline value without counting won or lost deals", () => {
    saveDeals([
      deal,
      { ...deal, id: "won", stage: "Customer", value: 10000 },
      { ...deal, id: "lost", stage: "Closed Lost", value: 5000 },
    ]);
    expect(queryDataSource("pipelineValueKpi")).toMatchObject({ value: "$2K", label: "1 active deal" });
    expect(queryDataSource("winRateKpi")).toEqual({ value: "50%", label: "1 won of 2 closed deals" });
    expect(queryDataSource("topDeals")).toMatchObject({ rows: [["Pilot", "—", "Lead", "$2K", expect.any(String), "Test owner"]] });
    expect(queryDataSource("totalDealsKpi")).toEqual({ value: "3", label: "1 in pipeline" });
    expect(queryDataSource("dealsByStage")).toEqual([
      { name: "New", value: 0 }, { name: "Lead", value: 1 },
      { name: "Qualified", value: 0 }, { name: "Proposal", value: 0 },
      { name: "Negotiation", value: 0 }, { name: "Customer", value: 1 },
      { name: "Closed Lost", value: 1 },
    ]);
  });

  it("handles an empty dataset without NaN averages", () => {
    saveDeals([]);
    expect(queryDataSource("avgDealSizeKpi")).toMatchObject({ value: "$0", label: "Across 0 won deals" });
    expect(queryDataSource("pipelineValueKpi")).toMatchObject({ value: "$0", label: "0 active deals" });
  });

  it("buckets monthly values by year and month, not month name alone", () => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1, 12).toISOString();
    const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1, 12).toISOString();
    saveDeals([
      { ...deal, id: "now", createdAt: thisMonth, value: 3000 },
      { ...deal, id: "old", createdAt: yearAgo, value: 9000 },
    ]);
    const trend = queryDataSource("dealValuesTrend") as { value: number }[];
    expect(trend).toHaveLength(6);
    expect(trend[5].value).toBe(3000);
    expect(trend.reduce((s, p) => s + p.value, 0)).toBe(3000);
  });

  it("agrees with itself and the board: bars add up to totals, churned deals count", () => {
    const deals: Deal[] = [
      { ...deal, id: "a", stage: "Lead", value: 10000, probability: 30 },
      { ...deal, id: "b", stage: "Proposal", value: 20000, probability: 55 },
      { ...deal, id: "c", stage: "Customer", value: 5000 },
      { ...deal, id: "d", stage: "Churned", value: 7000 },
      { ...deal, id: "e", stage: "Closed Lost", value: 1000 },
    ];
    saveDeals(deals);
    // Weighted uses each deal's own probability, like the board and Deals table.
    expect(queryDataSource("weightedPipelineKpi")).toMatchObject({ value: "$14K" });
    const byStage = queryDataSource("dealsByStage") as { name: string; value: number }[];
    expect(byStage.find((p) => p.name === "Churned")?.value).toBe(1);
    expect(byStage.reduce((sum, p) => sum + p.value, 0)).toBe(deals.length);
    // A churned customer was still won.
    expect(queryDataSource("winRateKpi")).toMatchObject({ value: "67%", label: "2 won of 3 closed deals" });
  });

  it("folds small industries into Other so deal value by industry sums to the total", () => {
    const industries = ["AI", "Fintech", "Retail", "Health", "Media", "Travel", "Gaming", "Energy", "Legal", "Food"];
    saveOrganizations(industries.map((industry, i) => ({ id: `o${i}`, name: `Org ${i}`, industry }) as Organization));
    saveDeals(industries.map((_, i) => ({ ...deal, id: `d${i}`, organizationId: `o${i}`, value: (i + 1) * 1000 })));
    const bars = queryDataSource("dealValueByIndustry") as { name: string; value: number }[];
    expect(bars).toHaveLength(8);
    expect(bars.at(-1)?.name).toBe("Other");
    expect(bars.reduce((sum, p) => sum + p.value, 0)).toBe(55000);
  });

  it("a deal won today shows in this month's won revenue", () => {
    const won = withStage({ ...deal, expectedCloseDate: "2030-01-01" }, "Customer");
    saveDeals([won]);
    const months = queryDataSource("wonRevenueByMonth") as { value: number }[];
    expect(months.at(-1)?.value).toBe(2000);
  });

  it("returns null for an unknown data source", () => {
    expect(queryDataSource("missing-source")).toBeNull();
  });
});
