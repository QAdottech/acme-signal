import { getOrganizations } from "@/lib/organizationData";
import { getDeals } from "@/lib/dealData";
import { getPeople } from "@/lib/personData";
import type { DealStage } from "@/types/organization";

// ── Types ──────────────────────────────────────────────────────────────

export type ReportType =
  | "pipeline-overview"
  | "revenue-deals"
  | "contacts-companies"
  | string;

export type WidgetType =
  | "bar-chart"
  | "donut-chart"
  | "line-chart"
  | "kpi-card"
  | "data-table";

export interface WidgetConfig {
  id: string;
  title: string;
  type: WidgetType;
  dataSource: string;
  span?: 1 | 2;
}

export interface ReportDefinition {
  id: string;
  title: string;
  description: string;
  type: ReportType;
  isBuiltIn: boolean;
  widgets: WidgetConfig[];
  createdAt: string;
}

// ── Chart color palette ────────────────────────────────────────────────

export const CHART_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

// ── Built-in report definitions ────────────────────────────────────────

const builtInReports: ReportDefinition[] = [
  {
    id: "pipeline-overview",
    title: "Pipeline Overview",
    description:
      "Track deals across pipeline stages, total value, and win rates.",
    type: "pipeline-overview",
    isBuiltIn: true,
    widgets: [
      {
        id: "pipeline-value-kpi",
        title: "Pipeline Value",
        type: "kpi-card",
        dataSource: "pipelineValueKpi",
        span: 1,
      },
      {
        id: "win-rate-kpi",
        title: "Win Rate",
        type: "kpi-card",
        dataSource: "winRateKpi",
        span: 1,
      },
      {
        id: "deals-by-stage",
        title: "Deals by Stage",
        type: "bar-chart",
        dataSource: "dealsByStage",
        span: 2,
      },
      {
        id: "top-deals-table",
        title: "Top Deals",
        type: "data-table",
        dataSource: "topDeals",
        span: 2,
      },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "revenue-deals",
    title: "Revenue & Deals",
    description:
      "Analyze deal values over time, average deal size, and ownership.",
    type: "revenue-deals",
    isBuiltIn: true,
    widgets: [
      {
        id: "avg-deal-size-kpi",
        title: "Average Deal Size",
        type: "kpi-card",
        dataSource: "avgDealSizeKpi",
        span: 1,
      },
      {
        id: "total-deals-kpi",
        title: "Total Deals",
        type: "kpi-card",
        dataSource: "totalDealsKpi",
        span: 1,
      },
      {
        id: "deal-values-trend",
        title: "Deal Values Trend",
        type: "line-chart",
        dataSource: "dealValuesTrend",
        span: 2,
      },
      {
        id: "deals-by-owner",
        title: "Deals by Owner",
        type: "donut-chart",
        dataSource: "dealsByOwner",
        span: 1,
      },
      {
        id: "deals-value-by-stage",
        title: "Deal Value by Stage",
        type: "bar-chart",
        dataSource: "dealValueByStage",
        span: 1,
      },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "contacts-companies",
    title: "Contacts & Companies",
    description:
      "Explore industry distribution, geographic spread, and growth.",
    type: "contacts-companies",
    isBuiltIn: true,
    widgets: [
      {
        id: "total-contacts-kpi",
        title: "Total Contacts",
        type: "kpi-card",
        dataSource: "totalContactsKpi",
        span: 1,
      },
      {
        id: "total-companies-kpi",
        title: "Total Companies",
        type: "kpi-card",
        dataSource: "totalCompaniesKpi",
        span: 1,
      },
      {
        id: "industry-distribution",
        title: "Industry Distribution",
        type: "donut-chart",
        dataSource: "industryDistribution",
        span: 1,
      },
      {
        id: "geographic-distribution",
        title: "Geographic Distribution",
        type: "bar-chart",
        dataSource: "geographicDistribution",
        span: 1,
      },
      {
        id: "growth-over-time",
        title: "Growth Over Time",
        type: "line-chart",
        dataSource: "growthOverTime",
        span: 2,
      },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
  },
];

// ── Report retrieval ───────────────────────────────────────────────────

export function getBuiltInReports(): ReportDefinition[] {
  return builtInReports;
}

export function getCustomReports(): ReportDefinition[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("custom-reports");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function getAllReports(): ReportDefinition[] {
  return [...getBuiltInReports(), ...getCustomReports()];
}

export function getReportById(id: string): ReportDefinition | undefined {
  return getAllReports().find((r) => r.id === id);
}

// ── Currency formatter ─────────────────────────────────────────────────

export function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

// ── Data query functions ───────────────────────────────────────────────

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface KpiData {
  value: string;
  label: string;
  trend?: { value: number; isPositive: boolean };
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

const PIPELINE_STAGES: DealStage[] = [
  "New",
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
];

// Pipeline Overview data sources ────────────────────────────────────────

function getPipelineValueKpi(): KpiData {
  const deals = getDeals();
  const pipelineDeals = deals.filter((d) => PIPELINE_STAGES.includes(d.stage));
  const total = pipelineDeals.reduce((sum, d) => sum + d.value, 0);
  return {
    value: formatCurrency(total),
    label: `${pipelineDeals.length} active deals`,
    trend: { value: 8, isPositive: true },
  };
}

function getWinRateKpi(): KpiData {
  const deals = getDeals();
  const closedDeals = deals.filter(
    (d) => d.stage === "Customer" || d.stage === "Closed Lost"
  );
  const wonDeals = deals.filter((d) => d.stage === "Customer");
  const organizations = getOrganizations();
  const customerOrgs = organizations.filter(
    (o) => o.dealStage === "Customer"
  ).length;
  const lostOrgs = organizations.filter(
    (o) => o.dealStage === "Closed Lost"
  ).length;
  const totalClosed = customerOrgs + lostOrgs;
  const rate = totalClosed > 0 ? Math.round((customerOrgs / totalClosed) * 100) : 0;
  return {
    value: `${rate}%`,
    label: `${customerOrgs} won of ${totalClosed} closed`,
    trend: { value: 3, isPositive: true },
  };
}

function getDealsByStage(): ChartDataPoint[] {
  const deals = getDeals();
  const stages: DealStage[] = [
    "New",
    "Lead",
    "Qualified",
    "Proposal",
    "Negotiation",
    "Customer",
    "Closed Lost",
  ];
  return stages.map((stage) => ({
    name: stage,
    value: deals.filter((d) => d.stage === stage).length,
  }));
}

function getTopDeals(): TableData {
  const deals = getDeals();
  const organizations = getOrganizations();
  const sorted = [...deals].sort((a, b) => b.value - a.value).slice(0, 8);
  return {
    headers: ["Deal", "Company", "Value", "Stage", "Owner"],
    rows: sorted.map((d) => {
      const org = organizations.find((o) => o.id === d.organizationId);
      return [
        d.title,
        org?.name ?? "Unknown",
        formatCurrency(d.value),
        d.stage,
        d.owner,
      ];
    }),
  };
}

// Revenue & Deals data sources ──────────────────────────────────────────

function getAvgDealSizeKpi(): KpiData {
  const deals = getDeals();
  const avg = deals.length > 0
    ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length
    : 0;
  return {
    value: formatCurrency(Math.round(avg)),
    label: `Across ${deals.length} deals`,
    trend: { value: 12, isPositive: true },
  };
}

function getTotalDealsKpi(): KpiData {
  const deals = getDeals();
  const pipelineDeals = deals.filter((d) => PIPELINE_STAGES.includes(d.stage));
  return {
    value: String(deals.length),
    label: `${pipelineDeals.length} in pipeline`,
  };
}

function getDealValuesTrend(): ChartDataPoint[] {
  const deals = getDeals();
  // Group deals by creation month
  const monthMap: Record<string, number> = {};
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  deals.forEach((d) => {
    const date = new Date(d.createdAt);
    const key = months[date.getMonth()];
    monthMap[key] = (monthMap[key] || 0) + d.value;
  });

  // Build a rolling 6-month view ending at current month
  const now = new Date();
  const result: ChartDataPoint[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = months[date.getMonth()];
    result.push({ name: label, value: monthMap[label] || 0 });
  }
  return result;
}

function getDealsByOwner(): ChartDataPoint[] {
  const deals = getDeals();
  const ownerMap: Record<string, number> = {};
  deals.forEach((d) => {
    ownerMap[d.owner] = (ownerMap[d.owner] || 0) + 1;
  });
  return Object.entries(ownerMap).map(([name, value]) => ({ name, value }));
}

function getDealValueByStage(): ChartDataPoint[] {
  const deals = getDeals();
  const stages: DealStage[] = [
    "New",
    "Lead",
    "Qualified",
    "Proposal",
    "Negotiation",
  ];
  return stages.map((stage) => ({
    name: stage,
    value: deals
      .filter((d) => d.stage === stage)
      .reduce((sum, d) => sum + d.value, 0),
  }));
}

// Contacts & Companies data sources ─────────────────────────────────────

function getTotalContactsKpi(): KpiData {
  const people = getPeople();
  const active = people.filter((p) => p.status === "Active").length;
  return {
    value: String(people.length),
    label: `${active} active contacts`,
    trend: { value: 15, isPositive: true },
  };
}

function getTotalCompaniesKpi(): KpiData {
  const organizations = getOrganizations();
  const customers = organizations.filter(
    (o) => o.dealStage === "Customer"
  ).length;
  return {
    value: String(organizations.length),
    label: `${customers} are customers`,
    trend: { value: 10, isPositive: true },
  };
}

function getIndustryDistribution(): ChartDataPoint[] {
  const organizations = getOrganizations();
  const industryMap: Record<string, number> = {};
  organizations.forEach((org) => {
    industryMap[org.industry] = (industryMap[org.industry] || 0) + 1;
  });
  return Object.entries(industryMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getGeographicDistribution(): ChartDataPoint[] {
  const organizations = getOrganizations();
  const locationMap: Record<string, number> = {};
  organizations.forEach((org) => {
    // Normalize location (take city part)
    const city = org.location.split(",")[0].trim();
    locationMap[city] = (locationMap[city] || 0) + 1;
  });
  return Object.entries(locationMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getGrowthOverTime(): ChartDataPoint[] {
  const organizations = getOrganizations();
  const people = getPeople();
  // Simulated growth data showing progression to current totals
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  const orgCount = organizations.length;
  const peopleCount = people.length;

  return months.map((month, i) => {
    const factor = (i + 1) / months.length;
    return {
      name: month,
      value: Math.round(orgCount * factor),
      companies: Math.round(orgCount * factor),
      contacts: Math.round(peopleCount * factor),
    };
  });
}

// ── Data source registry ───────────────────────────────────────────────

type DataQueryResult = ChartDataPoint[] | KpiData | TableData;

const dataSourceRegistry: Record<string, () => DataQueryResult> = {
  // Pipeline Overview
  pipelineValueKpi: getPipelineValueKpi,
  winRateKpi: getWinRateKpi,
  dealsByStage: getDealsByStage,
  topDeals: getTopDeals,

  // Revenue & Deals
  avgDealSizeKpi: getAvgDealSizeKpi,
  totalDealsKpi: getTotalDealsKpi,
  dealValuesTrend: getDealValuesTrend,
  dealsByOwner: getDealsByOwner,
  dealValueByStage: getDealValueByStage,

  // Contacts & Companies
  totalContactsKpi: getTotalContactsKpi,
  totalCompaniesKpi: getTotalCompaniesKpi,
  industryDistribution: getIndustryDistribution,
  geographicDistribution: getGeographicDistribution,
  growthOverTime: getGrowthOverTime,
};

export function queryDataSource(key: string): DataQueryResult | null {
  const fn = dataSourceRegistry[key];
  if (!fn) return null;
  return fn();
}
