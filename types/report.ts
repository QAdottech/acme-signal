export interface WidgetConfig {
  id: string;
  title: string;
  type: "bar-chart" | "donut-chart" | "line-chart" | "kpi-card" | "data-table";
  dataSource: string;
  span?: 1 | 2;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  widgets: WidgetConfig[];
}

export interface CustomReport {
  id: string;
  title: string;
  description: string;
  templateId: string;
  widgets: WidgetConfig[];
  isBuiltIn: false;
  createdAt: string;
}
