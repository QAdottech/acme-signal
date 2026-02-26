export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  assignee: string;
  relatedDealId?: string;
  relatedOrganizationId?: string;
  relatedPersonId?: string;
  createdAt: string;
  completedAt?: string;
}
