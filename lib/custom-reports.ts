import type { ReportTemplate, CustomReport, WidgetConfig } from "@/types/report";

const STORAGE_KEY = "custom-reports";

export function getReportTemplates(): ReportTemplate[] {
  return [
    {
      id: "pipeline-by-stage",
      name: "Pipeline by Stage",
      description:
        "Bar chart of deals grouped by stage with KPI cards for total pipeline value and deal count.",
      icon: "BarChart3",
      widgets: [
        {
          id: "pipeline-stage-bar",
          title: "Deals by Stage",
          type: "bar-chart",
          dataSource: "dealsByStage",
          span: 2,
        },
        {
          id: "pipeline-total-value",
          title: "Total Pipeline Value",
          type: "kpi-card",
          dataSource: "pipelineValueKpi",
        },
        {
          id: "pipeline-deal-count",
          title: "Total Deal Count",
          type: "kpi-card",
          dataSource: "totalDealsKpi",
        },
      ],
    },
    {
      id: "deals-by-owner",
      name: "Deals by Owner",
      description:
        "Donut chart showing deal distribution by owner with a table of top deals.",
      icon: "Users",
      widgets: [
        {
          id: "owner-donut",
          title: "Deal Distribution by Owner",
          type: "donut-chart",
          dataSource: "dealsByOwner",
        },
        {
          id: "top-deals-table",
          title: "Top Deals",
          type: "data-table",
          dataSource: "topDeals",
        },
      ],
    },
    {
      id: "industry-breakdown",
      name: "Industry Breakdown",
      description:
        "Donut chart of organizations by industry and bar chart of deal value by industry.",
      icon: "Building2",
      widgets: [
        {
          id: "industry-donut",
          title: "Organizations by Industry",
          type: "donut-chart",
          dataSource: "industryDistribution",
        },
        {
          id: "industry-value-bar",
          title: "Deal Value by Industry",
          type: "bar-chart",
          dataSource: "dealValueByStage",
        },
      ],
    },
    {
      id: "contact-growth",
      name: "Contact Growth",
      description:
        "Line chart of contacts added over time with KPIs for total contacts and companies.",
      icon: "TrendingUp",
      widgets: [
        {
          id: "contact-growth-line",
          title: "Growth Over Time",
          type: "line-chart",
          dataSource: "growthOverTime",
          span: 2,
        },
        {
          id: "total-contacts-kpi",
          title: "Total Contacts",
          type: "kpi-card",
          dataSource: "totalContactsKpi",
        },
        {
          id: "total-companies-kpi",
          title: "Total Companies",
          type: "kpi-card",
          dataSource: "totalCompaniesKpi",
        },
      ],
    },
    {
      id: "activity-timeline",
      name: "Activity Timeline",
      description:
        "Overview of deal stages and top deals in your pipeline.",
      icon: "Activity",
      widgets: [
        {
          id: "activity-stage-bar",
          title: "Deals by Stage",
          type: "bar-chart",
          dataSource: "dealsByStage",
          span: 2,
        },
        {
          id: "activity-top-deals",
          title: "Top Deals",
          type: "data-table",
          dataSource: "topDeals",
          span: 2,
        },
      ],
    },
  ];
}

export function getCustomReports(): CustomReport[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function saveCustomReport(report: CustomReport): void {
  const reports = getCustomReports();
  reports.push(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function deleteCustomReport(id: string): void {
  const reports = getCustomReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function createReportFromTemplate(
  templateId: string,
  title: string,
  description: string
): CustomReport {
  const templates = getReportTemplates();
  const template = templates.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const report: CustomReport = {
    id: "report-" + Math.random().toString(36).substr(2, 9),
    title,
    description,
    templateId,
    widgets: template.widgets.map((w: WidgetConfig) => ({ ...w })),
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };

  saveCustomReport(report);
  return report;
}
