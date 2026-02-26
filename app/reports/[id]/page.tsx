"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  getReportById,
  queryDataSource,
  CHART_COLORS,
  formatCurrency,
  type ReportDefinition,
  type WidgetConfig,
  type ChartDataPoint,
  type KpiData,
  type TableData,
} from "@/lib/reports";

// ── Custom tooltip ─────────────────────────────────────────────────────

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md text-sm">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-muted-foreground" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === "number" && entry.value >= 1000
            ? formatCurrency(entry.value)
            : entry.value}
        </p>
      ))}
    </div>
  );
}

// ── Widget renderers ───────────────────────────────────────────────────

function BarChartWidget({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          className="text-muted-foreground"
        />
        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

function DonutChartWidget({ data }: { data: ChartDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={3}
          dataKey="value"
          nameKey="name"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(0)}%`
          }
          labelLine={true}
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value: string) => (
            <span className="text-xs text-muted-foreground">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

function LineChartWidget({ data }: { data: ChartDataPoint[] }) {
  // Determine which keys to plot (beyond 'name' and 'value')
  const extraKeys = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== "name" && k !== "value")
    : [];
  const hasExtraKeys = extraKeys.length > 0;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <defs>
          {hasExtraKeys ? (
            extraKeys.map((key, i) => (
              <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[i % CHART_COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))
          ) : (
            <linearGradient id="gradient-value" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
        <Tooltip content={<CustomTooltip />} />
        {hasExtraKeys ? (
          extraKeys.map((key, i) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[i % CHART_COLORS.length]}
              fill={`url(#gradient-${key})`}
              strokeWidth={2}
              name={key.charAt(0).toUpperCase() + key.slice(1)}
            />
          ))
        ) : (
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS[0]}
            fill="url(#gradient-value)"
            strokeWidth={2}
            name="Value"
          />
        )}
        {hasExtraKeys && <Legend />}
      </AreaChart>
    </ResponsiveContainer>
  );
}

function KpiCardWidget({ data }: { data: KpiData }) {
  return (
    <div className="flex flex-col items-start justify-center h-full min-h-[120px]">
      <p className="text-4xl font-bold tracking-tight">{data.value}</p>
      <p className="text-sm text-muted-foreground mt-1">{data.label}</p>
      {data.trend && (
        <p
          className={`text-xs mt-2 font-medium ${
            data.trend.isPositive ? "text-green-600" : "text-red-600"
          }`}
        >
          {data.trend.isPositive ? "+" : "-"}
          {Math.abs(data.trend.value)}% from last month
        </p>
      )}
    </div>
  );
}

function DataTableWidget({ data }: { data: TableData }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {data.headers.map((h) => (
              <th
                key={h}
                className="text-left py-2.5 px-3 font-medium text-muted-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className="border-b last:border-0 hover:bg-muted/50 transition-colors"
            >
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="py-2.5 px-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Widget renderer dispatcher ─────────────────────────────────────────

function WidgetRenderer({ widget }: { widget: WidgetConfig }) {
  const data = queryDataSource(widget.dataSource);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
        No data available
      </div>
    );
  }

  switch (widget.type) {
    case "bar-chart":
      return <BarChartWidget data={data as ChartDataPoint[]} />;
    case "donut-chart":
      return <DonutChartWidget data={data as ChartDataPoint[]} />;
    case "line-chart":
      return <LineChartWidget data={data as ChartDataPoint[]} />;
    case "kpi-card":
      return <KpiCardWidget data={data as KpiData} />;
    case "data-table":
      return <DataTableWidget data={data as TableData} />;
    default:
      return (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
          Unknown widget type
        </div>
      );
  }
}

// ── Report detail page ─────────────────────────────────────────────────

export default function ReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<ReportDefinition | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadReport = useCallback(() => {
    const id = params.id as string;
    const found = getReportById(id);
    setReport(found ?? null);
  }, [params.id]);

  useEffect(() => {
    loadReport();
  }, [loadReport, refreshKey]);

  if (!report) {
    return (
      <main className="container py-8 max-w-[1400px] mx-auto px-6">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.push("/reports")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Report not found</h1>
        </div>
        <p className="text-muted-foreground">
          The report you are looking for does not exist.
        </p>
      </main>
    );
  }

  return (
    <main className="container py-8 max-w-[1400px] mx-auto px-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/reports")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{report.title}</h1>
            <p className="text-muted-foreground mt-1">{report.description}</p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setRefreshKey((k) => k + 1)}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh data
        </Button>
      </div>

      {/* Widget grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2" key={refreshKey}>
        {report.widgets.map((widget) => (
          <Card
            key={widget.id}
            className={widget.span === 2 ? "md:col-span-2" : ""}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">
                {widget.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WidgetRenderer widget={widget} />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
