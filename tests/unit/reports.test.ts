import { describe, expect, it } from "vitest";
import { createReportFromTemplate, deleteCustomReport, getCustomReports } from "@/lib/custom-reports";
import { getAllReports, getBuiltInReports, getReportById, queryDataSource } from "@/lib/reports";
import { saveDeals } from "@/lib/dealData";
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
    expect(queryDataSource("pipelineValueKpi")).toMatchObject({ value: "$2K", label: "1 active deals" });
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
    expect(queryDataSource("avgDealSizeKpi")).toMatchObject({ value: "$0", label: "Across 0 deals" });
    expect(queryDataSource("pipelineValueKpi")).toMatchObject({ value: "$0", label: "0 active deals" });
  });

  it("returns null for an unknown data source", () => {
    expect(queryDataSource("missing-source")).toBeNull();
  });
});
