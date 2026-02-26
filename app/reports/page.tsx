"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, PieChart, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAllReports, type ReportDefinition } from "@/lib/reports";

const reportIcons: Record<string, React.ElementType> = {
  "pipeline-overview": BarChart3,
  "revenue-deals": TrendingUp,
  "contacts-companies": PieChart,
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportDefinition[]>([]);
  const router = useRouter();

  useEffect(() => {
    setReports(getAllReports());
  }, []);

  return (
    <main className="container py-8 max-w-[1400px] mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            Analyze your CRM data with built-in and custom reports.
          </p>
        </div>
        <Button disabled>
          <Plus className="w-4 h-4 mr-2" />
          Add report
        </Button>
      </div>

      {/* Report cards grid */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => {
          const Icon = reportIcons[report.type] ?? BarChart3;
          return (
            <Card
              key={report.id}
              className="cursor-pointer hover:bg-accent/50 transition-colors group"
              onClick={() => router.push(`/reports/${report.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {report.isBuiltIn && (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      Built-in
                    </span>
                  )}
                </div>
                <CardTitle className="text-base group-hover:text-primary transition-colors">
                  {report.title}
                </CardTitle>
                <CardDescription className="text-sm line-clamp-2">
                  {report.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  {report.widgets.length} widget{report.widgets.length !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
