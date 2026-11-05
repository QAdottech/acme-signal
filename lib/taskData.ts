import type { Task } from "@/types/task";
import { isDemoBugEnabled } from "@/lib/demo-bugs";

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
  {
    id: "t11",
    title: "Prepare Q2 business review for Spotify",
    description: "Pull usage numbers and renewal timeline for the Spotify account review.",
    status: "todo",
    priority: "high",
    dueDate: daysFromNow(4),
    assignee: "James Morrison",
    relatedOrganizationId: "1",
    relatedPersonId: "28",
    createdAt: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: "t12",
    title: "Send Anthropic security questionnaire answers",
    description: "Noah asked for the completed SOC 2 questionnaire before the procurement call.",
    status: "in_progress",
    priority: "urgent",
    dueDate: daysFromNow(1),
    assignee: "James Morrison",
    relatedDealId: "d7",
    relatedOrganizationId: "12",
    relatedPersonId: "27",
    createdAt: new Date(Date.now() - 3 * DAY).toISOString(),
  },
  {
    id: "t13",
    title: "Follow up with Klara on legal AI pilot scope",
    description: "Confirm which practice groups join the pilot and the success metrics.",
    status: "todo",
    priority: "medium",
    dueDate: daysFromNow(6),
    assignee: "James Morrison",
    relatedDealId: "d13",
    relatedOrganizationId: "21",
    relatedPersonId: "25",
    createdAt: new Date(Date.now() - 1 * DAY).toISOString(),
  },
  {
    id: "t14",
    title: "Book onboarding session for Klarna data team",
    description: "Analytics module is signed; schedule the onboarding workshop.",
    status: "done",
    priority: "medium",
    dueDate: daysFromNow(-3),
    assignee: "James Morrison",
    relatedDealId: "d19",
    relatedOrganizationId: "8",
    relatedPersonId: "3",
    createdAt: new Date(Date.now() - 9 * DAY).toISOString(),
    completedAt: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: "t15",
    title: "Draft volume pricing for Cursor",
    description: "Tomás asked for pricing at 500 and 1,000 seats.",
    status: "todo",
    priority: "high",
    dueDate: daysFromNow(2),
    assignee: "Elena Vasquez",
    relatedDealId: "d14",
    relatedOrganizationId: "23",
    relatedPersonId: "29",
    createdAt: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: "t16",
    title: "Review Listen Labs evaluation feedback",
    description: "Maya shared notes from their vendor comparison; summarise objections.",
    status: "todo",
    priority: "medium",
    dueDate: daysFromNow(8),
    assignee: "Elena Vasquez",
    relatedDealId: "d16",
    relatedOrganizationId: "25",
    relatedPersonId: "26",
    createdAt: new Date(Date.now() - 1 * DAY).toISOString(),
  },
  {
    id: "t17",
    title: "Run QA.tech sandbox walkthrough",
    description: "Ines wants a hands-on session before procurement.",
    status: "todo",
    priority: "high",
    dueDate: daysFromNow(3),
    assignee: "Sarah Chen",
    relatedDealId: "d1",
    relatedOrganizationId: "3",
    relatedPersonId: "19",
    createdAt: new Date(Date.now() - 2 * DAY).toISOString(),
  },
  {
    id: "t18",
    title: "Log Overstory discovery call notes",
    description: "Capture the utilities use case and next steps from Tuesday's call.",
    status: "done",
    priority: "low",
    dueDate: daysFromNow(-1),
    assignee: "Sarah Chen",
    relatedDealId: "d10",
    relatedOrganizationId: "18",
    relatedPersonId: "22",
    createdAt: new Date(Date.now() - 4 * DAY).toISOString(),
    completedAt: new Date(Date.now() - 1 * DAY).toISOString(),
  },
  {
    id: "t19",
    title: "Get DPA countersigned for Spotify renewal",
    description: "Elin needs the DPA back before quarter end.",
    status: "in_progress",
    priority: "high",
    dueDate: daysFromNow(5),
    assignee: "Sarah Johnson",
    relatedDealId: "d18",
    relatedOrganizationId: "1",
    relatedPersonId: "28",
    createdAt: new Date(Date.now() - 6 * DAY).toISOString(),
  },
  {
    id: "t20",
    title: "Send Atlar pilot success criteria",
    description: "Johan wants clear success criteria before approving the pilot.",
    status: "todo",
    priority: "medium",
    dueDate: daysFromNow(9),
    assignee: "David Martinez",
    relatedDealId: "d12",
    relatedOrganizationId: "20",
    relatedPersonId: "24",
    createdAt: new Date(Date.now() - 1 * DAY).toISOString(),
  },
  {
    id: "t21",
    title: "Close out Jasper loss review",
    description: "Write up why we lost the content platform deal.",
    status: "done",
    priority: "low",
    dueDate: daysFromNow(-6),
    assignee: "Sarah Johnson",
    relatedDealId: "d26",
    relatedOrganizationId: "17",
    relatedPersonId: "17",
    createdAt: new Date(Date.now() - 12 * DAY).toISOString(),
    completedAt: new Date(Date.now() - 5 * DAY).toISOString(),
  },
  {
    id: "t22",
    title: "Share SSO setup guide with Cradle",
    description: "Femke needs SSO before the research team rolls out.",
    status: "todo",
    priority: "medium",
    dueDate: daysFromNow(11),
    assignee: "Michael Chen",
    relatedDealId: "d11",
    relatedOrganizationId: "19",
    relatedPersonId: "23",
    createdAt: new Date(Date.now() - 1 * DAY).toISOString(),
  },
  {
    id: "t23",
    title: "Prepare Depict.ai API limits summary",
    description: "Linnea asked for rate limits in writing.",
    status: "todo",
    priority: "low",
    dueDate: daysFromNow(13),
    assignee: "Sarah Johnson",
    relatedDealId: "d8",
    relatedOrganizationId: "13",
    relatedPersonId: "21",
    createdAt: new Date(Date.now() - 0 * DAY).toISOString(),
  },
  {
    id: "t24",
    title: "Check in with Wolt on courier insights usage",
    description: "Quarterly usage review with Hanna.",
    status: "todo",
    priority: "low",
    dueDate: daysFromNow(-4),
    assignee: "Michael Chen",
    relatedDealId: "d21",
    relatedOrganizationId: "2",
    relatedPersonId: "30",
    createdAt: new Date(Date.now() - 10 * DAY).toISOString(),
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
  window.dispatchEvent(new Event("tasks-updated"));
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

// Includes today and the following seven calendar days, in UTC like stored due dates.
export function isDueSoon(task: Task): boolean {
  if (task.status === "done" || !task.dueDate) return false;
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const end = new Date(now);
  end.setUTCDate(end.getUTCDate() + 7);
  const lastDay = end.toISOString().split("T")[0];
  return task.dueDate >= today && task.dueDate <= lastDay;
}

export function getOverdueTasks(): Task[] {
  const today = new Date().toISOString().split("T")[0];
  return getTasks().filter(
    (t) => t.status !== "done" && t.dueDate && t.dueDate < today
  );
}

/** Complete an open task, or reopen a completed one. */
export function toggleTaskDone(task: Task): Task | undefined {
  const done = task.status !== "done";
  return updateTask(task.id, {
    status: done ? "done" : "todo",
    completedAt: done ? new Date().toISOString() : undefined,
  });
}

/** An unfinished task whose due date has passed (UTC calendar day). */
export function isOverdue(task: Task): boolean {
  if (task.status === "done" || !task.dueDate) return false;
  const today = new Date().toISOString().split("T")[0];
  // DEMO BUG: due-today-overdue
  if (isDemoBugEnabled("due-today-overdue")) return task.dueDate <= today;
  return task.dueDate < today;
}
