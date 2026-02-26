"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  Activity,
  ArrowLeft,
} from "lucide-react";
import {
  getReportTemplates,
  createReportFromTemplate,
} from "@/lib/custom-reports";
import type { ReportTemplate } from "@/types/report";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  BarChart3,
  Users,
  Building2,
  TrendingUp,
  Activity,
};

const widgetTypeLabels: Record<string, string> = {
  "bar-chart": "Bar Chart",
  "donut-chart": "Donut Chart",
  "line-chart": "Line Chart",
  "kpi-card": "KPI Card",
  "data-table": "Data Table",
};

interface CreateReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateReportDialog({
  open,
  onOpenChange,
}: CreateReportDialogProps) {
  const router = useRouter();
  const templates = getReportTemplates();

  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportTemplate | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSelectTemplate = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDescription(template.description);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setTitle("");
    setDescription("");
  };

  const handleCreate = () => {
    if (!selectedTemplate) return;
    const report = createReportFromTemplate(
      selectedTemplate.id,
      title,
      description
    );
    onOpenChange(false);
    setSelectedTemplate(null);
    setTitle("");
    setDescription("");
    router.push(`/reports/${report.id}`);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      setSelectedTemplate(null);
      setTitle("");
      setDescription("");
    }
    onOpenChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px]">
        {!selectedTemplate ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Report</DialogTitle>
              <DialogDescription>
                Choose a template to get started with your custom report.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4 max-h-[460px] overflow-y-auto">
              {templates.map((template) => {
                const Icon = iconMap[template.icon] || BarChart3;
                const chartTypes = [
                  ...new Set(template.widgets.map((w) => widgetTypeLabels[w.type])),
                ];

                return (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template)}
                    className="group flex flex-col gap-3 rounded-lg border border-gray-200 dark:border-gray-800 p-4 text-left transition-all hover:border-indigo-400 hover:shadow-md hover:shadow-indigo-100 dark:hover:shadow-indigo-950/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {template.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {chartTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBack}
                  className="rounded-md p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div>
                  <DialogTitle>Configure Report</DialogTitle>
                  <DialogDescription>
                    Customize the title and description before creating.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-4">
              {/* Selected template preview */}
              <div className="flex items-center gap-3 rounded-lg border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 p-3">
                {(() => {
                  const Icon = iconMap[selectedTemplate.icon] || BarChart3;
                  return (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </div>
                  );
                })()}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {selectedTemplate.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedTemplate.widgets.length} widgets
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="report-title">Report Title</Label>
                  <Input
                    id="report-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="My Custom Report"
                    className="focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="report-description">Description</Label>
                  <Input
                    id="report-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe this report..."
                    className="focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Widget preview */}
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
                  Included Widgets
                </p>
                <div className="space-y-1.5">
                  {selectedTemplate.widgets.map((widget) => (
                    <div
                      key={widget.id}
                      className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="text-gray-700 dark:text-gray-300">
                        {widget.title}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {widgetTypeLabels[widget.type]}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleBack}>
                Back
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!title.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Create Report
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
