"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, RefreshCw, Trash2 } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { RecordNotFound } from "@/components/record-page/blocks";
import { DeleteReportDialog } from "@/components/reports/delete-report-dialog";
import {
  CHART_OTHER,
  CHART_PALETTE,
  CHART_PRIMARY,
  dataSourceFormat,
  formatCurrency,
  getReportById,
  queryDataSource,
  type ChartDataPoint,
  type KpiData,
  type ReportDefinition,
  type TableData,
  type ValueFormat,
  type WidgetConfig,
} from "@/lib/reports";
import { cn } from "@/lib/utils";

const AXIS_TICK = { fontSize: 12, fill: "hsl(var(--muted-foreground))" };
const GRID_STROKE = "hsl(var(--border))";

function formatValue(value: number, format: ValueFormat) {
  return format === "currency" ? formatCurrency(value) : value.toLocaleString("en-US");
}

// ── Tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  format,
}: {
  active?: boolean;
  payload?: { name: string; value: number; payload?: { fill?: string; name?: string } }[];
  label?: string;
  format: ValueFormat;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="mb-0.5 font-medium text-foreground">{label ?? entry.payload?.name ?? entry.name}</p>
      <p className="flex items-center gap-1.5 tabular-nums text-muted-foreground">
        <span className="h-2 w-2 rounded-[2px]" style={{ background: entry.payload?.fill ?? CHART_PRIMARY }} />
        {formatValue(entry.value, format)}
      </p>
    </div>
  );
}

// ── Widgets ────────────────────────────────────────────────────────────

/**
 * One measure across categories: one hue, values labelled on the bars. Long
 * or many category names switch to horizontal bars so labels never collide.
 */
function BarChartWidget({ data, format }: { data: ChartDataPoint[]; format: ValueFormat }) {
  const horizontal = data.length > 7 || data.some((d) => d.name.length > 12);
  const label = (
    <LabelList
      dataKey="value"
      position={horizontal ? "right" : "top"}
      style={{ fontSize: 12, fill: "hsl(var(--foreground))", fontVariantNumeric: "tabular-nums" }}
      formatter={(v: number) => (v ? formatValue(v, format) : "")}
    />
  );
  const tooltip = <Tooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltip format={format} />} />;

  if (horizontal) {
    return (
      <ResponsiveContainer width="100%" height={Math.max(160, data.length * 32 + 16)}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 48, left: 0, bottom: 0 }} barCategoryGap="22%">
          <XAxis type="number" hide allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="name"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            width={150}
            interval={0}
          />
          {tooltip}
          <Bar dataKey="value" fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} maxBarSize={22} isAnimationActive={false}>
            {label}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 20, right: 8, left: 0, bottom: 0 }} barCategoryGap="24%">
        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} interval={0} />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={52}
          allowDecimals={false}
          tickFormatter={(v: number) => formatValue(v, format)}
        />
        {tooltip}
        <Bar dataKey="value" fill={CHART_PRIMARY} radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false}>
          {label}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Change over time: one 2px line with a soft fill and visible points. */
function LineChartWidget({ data, format }: { data: ChartDataPoint[]; format: ValueFormat }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 20, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="report-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.18} />
            <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID_STROKE} />
        <XAxis dataKey="name" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID_STROKE }} />
        <YAxis
          tick={AXIS_TICK}
          tickLine={false}
          axisLine={false}
          width={52}
          allowDecimals={false}
          tickFormatter={(v: number) => formatValue(v, format)}
        />
        <Tooltip
          cursor={{ stroke: "hsl(var(--muted-foreground))", strokeDasharray: "3 3" }}
          content={<ChartTooltip format={format} />}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={CHART_PRIMARY}
          strokeWidth={2}
          fill="url(#report-area)"
          dot={{ r: 4, fill: CHART_PRIMARY, stroke: "hsl(var(--background))", strokeWidth: 2 }}
          activeDot={{ r: 5, stroke: "hsl(var(--background))", strokeWidth: 2 }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * Share of a whole: palette in fixed order, "Other" in grey, and a labelled
 * legend with counts and percentages so identity never relies on colour.
 */
function DonutChartWidget({ data, format }: { data: ChartDataPoint[]; format: ValueFormat }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let paletteIndex = 0;
  const slices = data.map((d) => ({
    ...d,
    fill: d.name === "Other" ? CHART_OTHER : CHART_PALETTE[paletteIndex++ % CHART_PALETTE.length],
  }));
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-[220px] w-[220px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={100}
              paddingAngle={0}
              stroke="hsl(var(--background))"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {slices.map((slice) => (
                <Cell key={slice.name} fill={slice.fill} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip format={format} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums tracking-tight">{formatValue(total, format)}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <ul className="w-full min-w-0 flex-1 space-y-1.5 text-[13px]">
        {slices.map((slice) => (
          <li key={slice.name} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-[3px]" style={{ background: slice.fill }} />
            <span className="min-w-0 flex-1 truncate">{slice.name}</span>
            <span className="tabular-nums text-foreground">{formatValue(slice.value, format)}</span>
            <span className="w-10 text-right tabular-nums text-muted-foreground">
              {total > 0 ? Math.round((slice.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DataTableWidget({ data }: { data: TableData }) {
  if (data.rows.length === 0) return <EmptyWidget message="Nothing to show yet." />;
  return (
    <div className="-mx-4 overflow-x-auto">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-y bg-muted/40">
            {data.headers.map((h) => (
              <th key={h} className="h-8 px-4 text-left text-xs font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIdx) => (
            <tr key={rowIdx} className="border-b last:border-0 hover:bg-muted/40">
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className={cn("h-10 px-4 tabular-nums", cellIdx > 0 && "text-muted-foreground")}>
                  {cellIdx === 0 && data.rowHrefs?.[rowIdx] ? (
                    <Link prefetch={false} href={data.rowHrefs[rowIdx]} className="font-medium text-foreground hover:underline">
                      {cell}
                    </Link>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyWidget({ message }: { message: string }) {
  return <div className="flex h-[200px] items-center justify-center text-[13px] text-muted-foreground">{message}</div>;
}

function ChartWidget({ widget }: { widget: WidgetConfig }) {
  const data = queryDataSource(widget.dataSource);
  if (!data) return <EmptyWidget message="No data available" />;
  const format = dataSourceFormat(widget.dataSource);
  const points = data as ChartDataPoint[];
  const isChart = widget.type === "bar-chart" || widget.type === "line-chart" || widget.type === "donut-chart";
  if (isChart && (!Array.isArray(data) || points.every((p) => !p.value))) {
    return <EmptyWidget message="No data for this period yet." />;
  }
  switch (widget.type) {
    case "bar-chart":
      return <BarChartWidget data={points} format={format} />;
    case "line-chart":
      return <LineChartWidget data={points} format={format} />;
    case "donut-chart":
      return <DonutChartWidget data={points} format={format} />;
    case "data-table":
      return <DataTableWidget data={data as TableData} />;
    default:
      return <EmptyWidget message="Unknown widget type" />;
  }
}

function KpiTile({ widget }: { widget: WidgetConfig }) {
  const data = queryDataSource(widget.dataSource) as KpiData | null;
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="text-xs text-muted-foreground">{widget.title}</div>
      <div className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{data?.value ?? "—"}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{data?.label ?? "No data available"}</div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────

export default function ReportDetailPage() {
  const params = useParams();
  const [report, setReport] = useState<ReportDefinition | null | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadReport = useCallback(() => {
    setReport(getReportById(params.id as string) ?? null);
  }, [params.id]);

  useEffect(() => {
    loadReport();
  }, [loadReport, refreshKey]);

  if (report === undefined) return null;
  if (report === null) return <RecordNotFound noun="report" href="/reports" label="Back to Reports" />;

  const kpis = report.widgets.filter((w) => w.type === "kpi-card");
  const panels = report.widgets.filter((w) => w.type !== "kpi-card");

  return (
    <main className="mx-auto w-full max-w-[1200px] px-8 py-6">
      <nav aria-label="Breadcrumb" className="mb-1.5 flex items-center gap-1 text-[13px] text-muted-foreground">
        <Link href="/reports" className="transition-colors hover:text-foreground">
          Reports
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
      </nav>
      <PageHeader
        title={report.title}
        description={report.description}
        actions={
          <>
            {!report.isBuiltIn && (
              <Button variant="outline" size="icon" aria-label="Delete report" onClick={() => setDeleteOpen(true)}>
                <Trash2 />
              </Button>
            )}
            <Button variant="outline" onClick={() => setRefreshKey((k) => k + 1)}>
              <RefreshCw />
              Refresh data
            </Button>
          </>
        }
      />

      <div key={refreshKey} className="space-y-4">
        {kpis.length > 0 && (
          <div className={cn("grid grid-cols-2 gap-3", kpis.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3")}>
            {kpis.map((widget) => (
              <KpiTile key={widget.id} widget={widget} />
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {panels.map((widget) => (
            <section
              key={widget.id}
              aria-label={widget.title}
              className={cn("rounded-lg border bg-background px-4 pb-4 pt-3", widget.span === 2 && "lg:col-span-2")}
            >
              <h2 className="mb-3 text-[13px] font-medium">{widget.title}</h2>
              <ChartWidget widget={widget} />
            </section>
          ))}
        </div>
      </div>

      {!report.isBuiltIn && (
        <DeleteReportDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          reportId={report.id}
          reportTitle={report.title}
        />
      )}
    </main>
  );
}
