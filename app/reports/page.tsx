"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, PieChart, TrendingUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllReports, type ReportDefinition } from "@/lib/reports";
import { CreateReportDialog } from "@/components/reports/create-report-dialog";
import { PageHeader } from "@/components/page-header";

const reportIcons: Record<string, React.ElementType> = {
  "pipeline-overview": BarChart3,
  "revenue-deals": TrendingUp,
  "contacts-companies": PieChart,
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setReports(getAllReports());
  }, []);

  // Refresh list when dialog closes (new report may have been added)
  useEffect(() => {
    if (!createOpen) {
      setReports(getAllReports());
    }
  }, [createOpen]);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-8 py-6">
      <PageHeader
        title="Reports"
        description="Analyze your CRM data with built-in and custom reports."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus />
            Add report
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = reportIcons[report.type] ?? BarChart3;
          return (
            <Link
              key={report.id}
              href={`/reports/${report.id}`}
              prefetch={false}
              className="group flex flex-col rounded-lg border bg-background p-4 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-md border bg-muted/50">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </span>
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                  {report.isBuiltIn ? "Built-in" : "Custom"}
                </span>
              </div>
              <h2 className="text-sm font-medium">{report.title}</h2>
              <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground">{report.description}</p>
              <p className="mt-auto pt-3 text-xs text-muted-foreground">
                {report.widgets.length} widget{report.widgets.length !== 1 ? "s" : ""}
              </p>
            </Link>
          );
        })}
      </div>

      <CreateReportDialog open={createOpen} onOpenChange={setCreateOpen} />
    </main>
  );
}
