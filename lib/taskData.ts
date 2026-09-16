import type { Task } from "@/types/task";
import { getSupabase, newId, throwIfError } from "@/lib/supabase";

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string | null;
  assignee: string | null;
  related_deal_id: string | null;
  related_organization_id: string | null;
  related_person_id: string | null;
  created_at: string;
  completed_at: string | null;
}

function mapTask(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    assignee: row.assignee ?? undefined,
    relatedDealId: row.related_deal_id ?? undefined,
    relatedOrganizationId: row.related_organization_id ?? undefined,
    relatedPersonId: row.related_person_id ?? undefined,
    createdAt: row.created_at,
    completedAt: row.completed_at ?? undefined,
  };
}

function toRow(task: Task): TaskRow {
  return {
    id: task.id,
    title: task.title,
    description: task.description ?? null,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate ?? null,
    assignee: task.assignee ?? null,
    related_deal_id: task.relatedDealId ?? null,
    related_organization_id: task.relatedOrganizationId ?? null,
    related_person_id: task.relatedPersonId ?? null,
    created_at: task.createdAt,
    completed_at: task.completedAt ?? null,
  };
}

export async function getTasks(): Promise<Task[]> {
  const { data, error } = await getSupabase().from("tasks").select("*");
  throwIfError(error, "getTasks");
  return ((data ?? []) as TaskRow[]).map(mapTask);
}

export async function getTask(id: string): Promise<Task | undefined> {
  const tasks = await getTasks();
  return tasks.find((task) => task.id === id);
}

export async function saveTasks(tasks: Task[]): Promise<void> {
  const existing = await getTasks();
  const nextIds = new Set(tasks.map((task) => task.id));
  const toDelete = existing
    .filter((task) => !nextIds.has(task.id))
    .map((task) => task.id);
  if (toDelete.length > 0) {
    const { error } = await getSupabase().from("tasks").delete().in("id", toDelete);
    throwIfError(error, "saveTasks.delete");
  }
  if (tasks.length === 0) return;
  const { error } = await getSupabase().from("tasks").upsert(tasks.map(toRow));
  throwIfError(error, "saveTasks");
}

export async function addTask(
  task: Omit<Task, "id" | "createdAt">
): Promise<Task> {
  const newTask: Task = {
    ...task,
    id: "t" + newId(),
    createdAt: new Date().toISOString(),
  };
  const { error } = await getSupabase().from("tasks").insert(toRow(newTask));
  throwIfError(error, "addTask");
  return newTask;
}

export async function updateTask(
  id: string,
  updates: Partial<Task>
): Promise<Task | undefined> {
  const tasks = await getTasks();
  const current = tasks.find((task) => task.id === id);
  if (!current) return undefined;
  const next = { ...current, ...updates };
  const { error } = await getSupabase()
    .from("tasks")
    .update(toRow(next))
    .eq("id", id);
  throwIfError(error, "updateTask");
  return next;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await getSupabase().from("tasks").delete().eq("id", id);
  throwIfError(error, "deleteTask");
}

export async function getTasksForDeal(dealId: string): Promise<Task[]> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("*")
    .eq("related_deal_id", dealId);
  throwIfError(error, "getTasksForDeal");
  return ((data ?? []) as TaskRow[]).map(mapTask);
}

export async function getTasksForOrganization(
  organizationId: string
): Promise<Task[]> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("*")
    .eq("related_organization_id", organizationId);
  throwIfError(error, "getTasksForOrganization");
  return ((data ?? []) as TaskRow[]).map(mapTask);
}

export async function getTasksForPerson(personId: string): Promise<Task[]> {
  const { data, error } = await getSupabase()
    .from("tasks")
    .select("*")
    .eq("related_person_id", personId);
  throwIfError(error, "getTasksForPerson");
  return ((data ?? []) as TaskRow[]).map(mapTask);
}

export async function getOverdueTasks(): Promise<Task[]> {
  const today = new Date().toISOString().split("T")[0];
  const tasks = await getTasks();
  return tasks.filter(
    (task) => task.status !== "done" && task.dueDate && task.dueDate < today
  );
}
