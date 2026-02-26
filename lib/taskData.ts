import type { Task } from "@/types/task";

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * DAY).toISOString().split("T")[0];
}

const defaultTasks: Task[] = [
  {
    id: "t1",
    title: "Send proposal to Anthropic",
    description:
      "Prepare and send the enterprise partnership proposal to the Anthropic team. Include pricing tiers and integration timeline.",
    status: "todo",
    priority: "high",
    dueDate: daysFromNow(1),
    assignee: "David Martinez",
    relatedDealId: "d7",
    relatedOrganizationId: "12",
    createdAt: new Date(Date.now() - 3 * DAY).toISOString(),
  },
  {
    id: "t2",
    title: "Schedule technical demo for Cursor",
    description:
      "Coordinate with engineering to set up a live technical demo of the developer tools bundle for the Cursor team.",
    status: "todo",
    priority: "medium",
    dueDate: daysFromNow(3),
    assignee: "Emma Wilson",
    relatedOrganizationId: "23",
    createdAt: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: "t3",
    title: "Follow up on Klarna contract review",
    description:
      "Legal has had the contract for a week. Escalate to get the review completed and address any concerns.",
    status: "todo",
    priority: "urgent",
    dueDate: daysFromNow(-2),
    assignee: "Michael Chen",
    relatedOrganizationId: "8",
    createdAt: new Date(Date.now() - 7 * DAY).toISOString(),
  },
  {
    id: "t4",
    title: "Prepare Perplexity onboarding docs",
    description:
      "Create onboarding documentation for the Perplexity search infrastructure deal. Include API guides and support contacts.",
    status: "todo",
    priority: "low",
    dueDate: daysFromNow(7),
    assignee: "Sarah Johnson",
    relatedOrganizationId: "24",
    createdAt: new Date(Date.now() - 1 * DAY).toISOString(),
  },
  {
    id: "t5",
    title: "Review Spotify quarterly metrics",
    description:
      "Compile and review Q1 metrics for the Spotify account. Prepare summary for the account review meeting.",
    status: "todo",
    priority: "medium",
    dueDate: daysFromNow(5),
    assignee: "Sarah Johnson",
    relatedOrganizationId: "1",
    createdAt: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: "t6",
    title: "Draft Vercel partnership agreement",
    description:
      "Work with legal to draft the partnership agreement for the Vercel edge network expansion deal.",
    status: "todo",
    priority: "high",
    dueDate: daysFromNow(2),
    assignee: "Emma Wilson",
    relatedOrganizationId: "4",
    createdAt: new Date(Date.now() - 4 * DAY).toISOString(),
  },
  {
    id: "t7",
    title: "Call Sana Labs for requirements",
    description:
      "Discovery call to understand Sana Labs' specific requirements for the e-commerce integration project.",
    status: "in_progress",
    priority: "medium",
    dueDate: daysFromNow(1),
    assignee: "David Martinez",
    relatedOrganizationId: "14",
    createdAt: new Date(Date.now() - 5 * DAY).toISOString(),
  },
  {
    id: "t8",
    title: "Update Figma deal pricing",
    description:
      "Revise the pricing model for the Figma contract automation suite based on their feedback from last meeting.",
    status: "todo",
    priority: "low",
    dueDate: daysFromNow(10),
    assignee: "Michael Chen",
    relatedOrganizationId: "15",
    createdAt: new Date(Date.now() - 1 * DAY).toISOString(),
  },
  {
    id: "t9",
    title: "Send Wolt integration timeline",
    description:
      "Deliver the integration timeline document to the Wolt team. They've been waiting for this since last week.",
    status: "todo",
    priority: "medium",
    dueDate: daysFromNow(-1),
    assignee: "Emma Wilson",
    relatedOrganizationId: "2",
    createdAt: new Date(Date.now() - 6 * DAY).toISOString(),
  },
  {
    id: "t10",
    title: "Finalize Hugging Face SOW",
    description:
      "Complete the Statement of Work for the ML Platform License deal. Needs sign-off from both sides.",
    status: "in_progress",
    priority: "high",
    dueDate: daysFromNow(4),
    assignee: "David Martinez",
    relatedOrganizationId: "16",
    createdAt: new Date(Date.now() - 8 * DAY).toISOString(),
  },
];

export function getTasks(): Task[] {
  if (typeof window === "undefined") return defaultTasks;
  const stored = localStorage.getItem("tasks");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultTasks;
    }
  }
  localStorage.setItem("tasks", JSON.stringify(defaultTasks));
  return defaultTasks;
}

export function getTask(id: string): Task | undefined {
  return getTasks().find((t) => t.id === id);
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

export function addTask(task: Omit<Task, "id" | "createdAt">): Task {
  const newTask: Task = {
    ...task,
    id: "t" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  const tasks = getTasks();
  tasks.push(newTask);
  saveTasks(tasks);
  return newTask;
}

export function updateTask(id: string, updates: Partial<Task>): Task | undefined {
  const tasks = getTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return undefined;
  tasks[index] = { ...tasks[index], ...updates };
  saveTasks(tasks);
  return tasks[index];
}

export function deleteTask(id: string): void {
  const tasks = getTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
}

export function getTasksForDeal(dealId: string): Task[] {
  return getTasks().filter((t) => t.relatedDealId === dealId);
}

export function getTasksForOrganization(organizationId: string): Task[] {
  return getTasks().filter((t) => t.relatedOrganizationId === organizationId);
}

export function getTasksForPerson(personId: string): Task[] {
  return getTasks().filter((t) => t.relatedPersonId === personId);
}

export function getOverdueTasks(): Task[] {
  const today = new Date().toISOString().split("T")[0];
  return getTasks().filter(
    (t) => t.status !== "done" && t.dueDate && t.dueDate < today
  );
}
