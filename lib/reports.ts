import { getOrganizations } from "@/lib/organizationData";
import { getDeals } from "@/lib/dealData";
import { getPeople } from "@/lib/personData";
import { formatDate, parseDate } from "@/lib/format";
import type { Deal } from "@/types/deal";
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

/**
 * Categorical palette, assigned in this fixed order and never cycled. Checked
 * for colour-vision deficiency (protan, deutan and tritan separation between
 * neighbours) and normal-vision distinctness. Three hues sit below 3:1
 * contrast on white, so every chart that uses them also labels its marks.
 * Past five categories, the rest fold into a grey "Other".
 */
export const CHART_PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"] as const;
export const CHART_OTHER = "#a1a1aa";
/** Single-series charts (bars, lines) use one hue. */
export const CHART_PRIMARY = CHART_PALETTE[0];

// ── Built-in report definitions ────────────────────────────────────────

const kpi = (id: string, title: string, dataSource: string): WidgetConfig => ({ id, title, type: "kpi-card", dataSource });

const builtInReports: ReportDefinition[] = [
  {
    id: "pipeline-overview",
    title: "Pipeline Overview",
    description: "Open pipeline by stage, weighted forecast, and win rate.",
    type: "pipeline-overview",
    isBuiltIn: true,
    widgets: [
      kpi("pipeline-value-kpi", "Open Pipeline", "pipelineValueKpi"),
      kpi("weighted-pipeline-kpi", "Weighted Pipeline", "weightedPipelineKpi"),
      kpi("win-rate-kpi", "Win Rate", "winRateKpi"),
      kpi("avg-deal-size-kpi", "Average Won Deal", "avgDealSizeKpi"),
      { id: "value-by-stage", title: "Open Pipeline by Stage", type: "bar-chart", dataSource: "dealValueByStage", span: 1 },
      { id: "deals-by-stage", title: "Deals by Stage", type: "bar-chart", dataSource: "dealsByStage", span: 1 },
      { id: "top-deals-table", title: "Largest Open Deals", type: "data-table", dataSource: "topDeals", span: 2 },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "revenue-deals",
    title: "Revenue & Deals",
    description: "Closed-won revenue by month, new pipeline created, and deal ownership.",
    type: "revenue-deals",
    isBuiltIn: true,
    widgets: [
      kpi("won-revenue-kpi", "Won Revenue", "wonRevenueKpi"),
      kpi("avg-deal-size-kpi", "Average Won Deal", "avgDealSizeKpi"),
      kpi("total-deals-kpi", "Total Deals", "totalDealsKpi"),
      kpi("win-rate-kpi", "Win Rate", "winRateKpi"),
      { id: "won-revenue-by-month", title: "Won Revenue by Month", type: "bar-chart", dataSource: "wonRevenueByMonth", span: 2 },
      { id: "deal-values-trend", title: "New Pipeline by Month", type: "line-chart", dataSource: "dealValuesTrend", span: 1 },
      { id: "deals-by-owner", title: "Deals by Owner", type: "donut-chart", dataSource: "dealsByOwner", span: 1 },
    ],
    createdAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "contacts-companies",
    title: "Contacts & Companies",
    description: "Who you know, where they are, and how recently you talked to them.",
    type: "contacts-companies",
    isBuiltIn: true,
    widgets: [
      kpi("total-contacts-kpi", "Total Contacts", "totalContactsKpi"),
      kpi("total-companies-kpi", "Total Companies", "totalCompaniesKpi"),
      kpi("contacted-recently-kpi", "Contacted in Last 30 Days", "contactedRecentlyKpi"),
      { id: "industry-distribution", title: "Companies by Industry", type: "bar-chart", dataSource: "industryDistribution", span: 1 },
      { id: "geographic-distribution", title: "Companies by City", type: "bar-chart", dataSource: "geographicDistribution", span: 1 },
      { id: "contact-recency", title: "Contacts by Last Touch", type: "bar-chart", dataSource: "contactRecency", span: 2 },
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
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
  /** Optional link for each row's first cell. */
  rowHrefs?: string[];
}

export type ValueFormat = "currency" | "count";

const OPEN_STAGES: DealStage[] = ["New", "Lead", "Qualified", "Proposal", "Negotiation"];
const ALL_DEAL_STAGES: DealStage[] = [...OPEN_STAGES, "Customer", "Closed Lost", "Churned"];
/** Deals that were won. A churned customer was still a won deal. */
const WON_STAGES: DealStage[] = ["Customer", "Churned"];
const MONTH_COUNT = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

const plural = (count: number, one: string, many = `${one}s`) => `${count} ${count === 1 ? one : many}`;
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const openDeals = (deals: Deal[]) => deals.filter((d) => OPEN_STAGES.includes(d.stage));
const wonDeals = (deals: Deal[]) => deals.filter((d) => WON_STAGES.includes(d.stage));

/** The last six calendar months, oldest first, keyed by year and month. */
function recentMonths(): { key: string; name: string }[] {
  const now = new Date();
  return Array.from({ length: MONTH_COUNT }, (_, i) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (MONTH_COUNT - 1 - i), 1);
    const sameYear = date.getFullYear() === now.getFullYear();
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      name: date.toLocaleDateString("en-US", { month: "short", ...(sameYear ? {} : { year: "2-digit" }) }),
    };
  });
}

function sumByMonth<T>(items: T[], dateOf: (item: T) => string | undefined, valueOf: (item: T) => number): ChartDataPoint[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    const raw = dateOf(item);
    if (!raw) continue;
    const date = parseDate(raw);
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    totals.set(key, (totals.get(key) ?? 0) + valueOf(item));
  }
  return recentMonths().map(({ key, name }) => ({ name, value: totals.get(key) ?? 0 }));
}

/**
 * Total a value per key, largest first, folding everything past `limit` into
 * "Other" so the bars always add up to the whole.
 */
function totalBy<T>(items: T[], keyOf: (item: T) => string, valueOf: (item: T) => number, limit: number): ChartDataPoint[] {
  const totals = new Map<string, number>();
  items.forEach((item) => totals.set(keyOf(item), (totals.get(keyOf(item)) ?? 0) + valueOf(item)));
  const sorted = Array.from(totals, ([name, value]) => ({ name, value })).sort(
    (a, b) => b.value - a.value || a.name.localeCompare(b.name)
  );
  if (sorted.length <= limit) return sorted;
  const rest = sum(sorted.slice(limit - 1).map((p) => p.value));
  return [...sorted.slice(0, limit - 1), { name: "Other", value: rest }];
}

function countBy(keys: string[], limit: number): ChartDataPoint[] {
  return totalBy(keys, (key) => key, () => 1, limit);
}

// Pipeline ──────────────────────────────────────────────────────────────

function getPipelineValueKpi(): KpiData {
  const open = openDeals(getDeals());
  return { value: formatCurrency(sum(open.map((d) => d.value))), label: plural(open.length, "active deal") };
}

function getWeightedPipelineKpi(): KpiData {
  const open = openDeals(getDeals());
  const weighted = sum(open.map((d) => (d.value * d.probability) / 100));
  return { value: formatCurrency(Math.round(weighted)), label: "Value × each deal's win probability" };
}

function getWinRateKpi(): KpiData {
  const deals = getDeals();
  const won = wonDeals(deals).length;
  const closed = won + deals.filter((d) => d.stage === "Closed Lost").length;
  const rate = closed > 0 ? Math.round((won / closed) * 100) : 0;
  return { value: `${rate}%`, label: `${won} won of ${plural(closed, "closed deal")}` };
}

function getDealsByStage(): ChartDataPoint[] {
  const deals = getDeals();
  // Every stage in board order; Churned only once a deal is in it.
  return ALL_DEAL_STAGES.map((stage) => ({ name: stage, value: deals.filter((d) => d.stage === stage).length })).filter(
    (point) => point.name !== "Churned" || point.value > 0
  );
}

function getDealValueByStage(): ChartDataPoint[] {
  const deals = getDeals();
  return OPEN_STAGES.map((stage) => ({
    name: stage,
    value: sum(deals.filter((d) => d.stage === stage).map((d) => d.value)),
  }));
}

function getTopDeals(): TableData {
  const organizations = getOrganizations();
  const top = openDeals(getDeals())
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  return {
    headers: ["Deal", "Company", "Stage", "Value", "Close date", "Owner"],
    rows: top.map((d) => [
      d.title,
      organizations.find((o) => o.id === d.organizationId)?.name ?? "—",
      d.stage,
      formatCurrency(d.value),
      formatDate(d.expectedCloseDate),
      d.owner,
    ]),
    rowHrefs: top.map((d) => `/deals/${d.id}`),
  };
}

// Revenue ───────────────────────────────────────────────────────────────

function getWonRevenueKpi(): KpiData {
  const won = wonDeals(getDeals());
  return { value: formatCurrency(sum(won.map((d) => d.value))), label: `From ${plural(won.length, "won deal")}` };
}

function getAvgDealSizeKpi(): KpiData {
  const won = wonDeals(getDeals());
  const avg = won.length > 0 ? sum(won.map((d) => d.value)) / won.length : 0;
  return { value: formatCurrency(Math.round(avg)), label: `Across ${plural(won.length, "won deal")}` };
}

function getTotalDealsKpi(): KpiData {
  const deals = getDeals();
  return { value: String(deals.length), label: `${openDeals(deals).length} in pipeline` };
}

/** Closed-won value by close month (a won deal's close date is when it closed). */
function getWonRevenueByMonth(): ChartDataPoint[] {
  return sumByMonth(wonDeals(getDeals()), (d) => d.expectedCloseDate, (d) => d.value);
}

/** Value of deals created each month, whatever stage they are in now. */
function getDealValuesTrend(): ChartDataPoint[] {
  return sumByMonth(getDeals(), (d) => d.createdAt, (d) => d.value);
}

function getDealsByOwner(): ChartDataPoint[] {
  return countBy(getDeals().map((d) => d.owner), CHART_PALETTE.length + 1);
}

function getDealValueByIndustry(): ChartDataPoint[] {
  const industryOf = new Map(getOrganizations().map((o) => [o.id, o.industry]));
  return totalBy(getDeals(), (d) => industryOf.get(d.organizationId) ?? "Unknown", (d) => d.value, 8);
}

// Contacts & companies ──────────────────────────────────────────────────

function getTotalContactsKpi(): KpiData {
  const people = getPeople();
  return { value: String(people.length), label: plural(people.filter((p) => p.status === "Active").length, "active contact") };
}

function getTotalCompaniesKpi(): KpiData {
  const organizations = getOrganizations();
  const customers = organizations.filter((o) => o.dealStage === "Customer").length;
  return { value: String(organizations.length), label: `${customers} ${customers === 1 ? "is a customer" : "are customers"}` };
}

function daysSince(value: string | undefined): number | null {
  if (!value) return null;
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / DAY_MS));
}

function getContactedRecentlyKpi(): KpiData {
  const people = getPeople();
  const recent = people.filter((p) => {
    const days = daysSince(p.lastContact);
    return days !== null && days <= 30;
  }).length;
  const share = people.length > 0 ? Math.round((recent / people.length) * 100) : 0;
  return { value: String(recent), label: `${share}% of contacts` };
}

function getIndustryDistribution(): ChartDataPoint[] {
  return countBy(getOrganizations().map((o) => o.industry), 8);
}

function getGeographicDistribution(): ChartDataPoint[] {
  return countBy(getOrganizations().map((o) => o.location.split(",")[0].trim()), 8);
}

const RECENCY_BUCKETS: { name: string; max: number }[] = [
  { name: "This week", max: 7 },
  { name: "8–30 days", max: 30 },
  { name: "1–3 months", max: 90 },
  { name: "3+ months", max: Infinity },
];

/** How long since each contact was last reached: shows who is going cold. */
function getContactRecency(): ChartDataPoint[] {
  const counts = RECENCY_BUCKETS.map((b) => ({ name: b.name, value: 0 }));
  let never = 0;
  for (const person of getPeople()) {
    const days = daysSince(person.lastContact);
    if (days === null) never++;
    else counts[RECENCY_BUCKETS.findIndex((b) => days <= b.max)].value++;
  }
  return [...counts, { name: "Never", value: never }];
}

// ── Data source registry ───────────────────────────────────────────────

type DataQueryResult = ChartDataPoint[] | KpiData | TableData;

const dataSourceRegistry: Record<string, () => DataQueryResult> = {
  pipelineValueKpi: getPipelineValueKpi,
  weightedPipelineKpi: getWeightedPipelineKpi,
  winRateKpi: getWinRateKpi,
  dealsByStage: getDealsByStage,
  dealValueByStage: getDealValueByStage,
  topDeals: getTopDeals,

  wonRevenueKpi: getWonRevenueKpi,
  avgDealSizeKpi: getAvgDealSizeKpi,
  totalDealsKpi: getTotalDealsKpi,
  wonRevenueByMonth: getWonRevenueByMonth,
  dealValuesTrend: getDealValuesTrend,
  dealsByOwner: getDealsByOwner,
  dealValueByIndustry: getDealValueByIndustry,

  totalContactsKpi: getTotalContactsKpi,
  totalCompaniesKpi: getTotalCompaniesKpi,
  contactedRecentlyKpi: getContactedRecentlyKpi,
  industryDistribution: getIndustryDistribution,
  geographicDistribution: getGeographicDistribution,
  contactRecency: getContactRecency,
  // Saved custom reports may still use the old key for this chart.
  growthOverTime: getContactRecency,
};

const CURRENCY_SOURCES = new Set(["dealValueByStage", "wonRevenueByMonth", "dealValuesTrend", "dealValueByIndustry"]);

/** Whether a chart's values are money or counts, for axes and tooltips. */
export function dataSourceFormat(key: string): ValueFormat {
  return CURRENCY_SOURCES.has(key) ? "currency" : "count";
}

export function queryDataSource(key: string): DataQueryResult | null {
  const fn = dataSourceRegistry[key];
  if (!fn) return null;
  return fn();
}
