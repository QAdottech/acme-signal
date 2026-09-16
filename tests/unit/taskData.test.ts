import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addTask, deleteTask, getOverdueTasks, getTask, getTasks,
  getTasksForDeal, getTasksForOrganization, getTasksForPerson,
  saveTasks, updateTask,
} from "@/lib/taskData";
import type { Task } from "@/types/task";

const input: Omit<Task, "id" | "createdAt"> = {
  title: "Follow up on proposal",
  status: "todo",
  priority: "high",
  relatedDealId: "deal-a",
  relatedOrganizationId: "company-a",
  relatedPersonId: "person-a",
};

beforeEach(() => saveTasks([]));

describe("tasks", () => {
  it("creates, updates, and deletes a task without changing unrelated tasks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));
    const task = addTask(input);
    const other = addTask({ ...input, title: "Other task" });

    expect(getTask(task.id)).toEqual({
      ...input, id: task.id, createdAt: "2026-06-01T12:00:00.000Z",
    });
    const updated = updateTask(task.id, { status: "done" });
    expect(updated).toEqual({ ...task, status: "done" });
    expect(getTasks()).toEqual([updated, other]);

    deleteTask(task.id);
    expect(getTask(task.id)).toBeUndefined();
    expect(getTasks()).toEqual([other]);
  });

  it("does not create a task when updating an unknown ID", () => {
    expect(updateTask("missing", { status: "done" })).toBeUndefined();
    expect(getTasks()).toEqual([]);
  });

  it("finds tasks by their related deal, company, and person", () => {
    const related = addTask(input);
    addTask({ title: "Unrelated", status: "todo", priority: "low" });

    expect(getTasksForDeal("deal-a")).toEqual([related]);
    expect(getTasksForOrganization("company-a")).toEqual([related]);
    expect(getTasksForPerson("person-a")).toEqual([related]);
    expect(getTasksForDeal("missing")).toEqual([]);
  });

  it("only treats unfinished tasks due before today as overdue (UTC boundary)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T00:00:00Z"));
    const overdue = addTask({ ...input, dueDate: "2026-05-31" });
    const inProgress = addTask({ ...input, dueDate: "2026-05-30", status: "in_progress" });
    addTask({ ...input, dueDate: "2026-05-31", status: "done" });
    addTask({ ...input, dueDate: "2026-06-01" });
    addTask({ ...input, dueDate: "2026-06-02" });
    addTask(input);

    expect(getOverdueTasks()).toEqual([overdue, inProgress]);
  });
});
