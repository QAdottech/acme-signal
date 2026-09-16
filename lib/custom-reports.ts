import type { ReportTemplate, CustomReport, WidgetConfig } from "@/types/report";
import { getSupabase, newId, throwIfError } from "@/lib/supabase";

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
      description: "Overview of deal stages and top deals in your pipeline.",
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

interface CustomReportRow {
  id: string;
  title: string;
  description: string;
  template_id: string | null;
  type: string | null;
  widgets: WidgetConfig[];
  is_built_in: boolean;
  created_at: string;
}

function mapReport(row: CustomReportRow): CustomReport {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    templateId: row.template_id ?? "",
    widgets: row.widgets ?? [],
    isBuiltIn: false,
    createdAt: row.created_at,
  };
}

export async function getCustomReports(): Promise<CustomReport[]> {
  const { data, error } = await getSupabase()
    .from("custom_reports")
    .select("*")
    .eq("is_built_in", false)
    .order("created_at", { ascending: false });
  throwIfError(error, "getCustomReports");
  return ((data ?? []) as CustomReportRow[]).map(mapReport);
}

export async function saveCustomReport(report: CustomReport): Promise<void> {
  const { error } = await getSupabase().from("custom_reports").insert({
    id: report.id,
    title: report.title,
    description: report.description,
    template_id: report.templateId,
    type: report.templateId,
    widgets: report.widgets,
    is_built_in: false,
    created_at: report.createdAt,
  });
  throwIfError(error, "saveCustomReport");
}

export async function deleteCustomReport(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("custom_reports")
    .delete()
    .eq("id", id);
  throwIfError(error, "deleteCustomReport");
}

export async function createReportFromTemplate(
  templateId: string,
  title: string,
  description: string
): Promise<CustomReport> {
  const templates = getReportTemplates();
  const template = templates.find((item) => item.id === templateId);
  if (!template) {
    throw new Error(`Template not found: ${templateId}`);
  }

  const report: CustomReport = {
    id: "report-" + newId(),
    title,
    description,
    templateId,
    widgets: template.widgets.map((widget: WidgetConfig) => ({ ...widget })),
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };

  await saveCustomReport(report);
  return report;
}
