"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CalendarDays, CircleDashed, Link2, Plus, Signal, Type, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddTaskModal } from "@/components/add-task-modal";
import { RecordListLayout } from "@/components/record-table/layout";
import { RecordTable, useRecordTableState, type Column } from "@/components/record-table/record-table";
import {
  FilterMenu,
  SearchField,
  countFilters,
  facetOptions,
  type FilterFacet,
  type FilterValues,
} from "@/components/record-table/toolbar";
import { TaskPeek } from "@/components/records/peeks";
import {
  AssigneeCell,
  CompleteToggle,
  PriorityCell,
  RelatedChip,
  StatusCell,
  TASK_PRIORITIES,
  resolveRelated,
  statusLabel,
} from "@/components/records/task-cells";
import { useConfirm } from "@/components/confirm-dialog";
import { useAuth } from "@/lib/auth-context";
import {
  addTask,
  deleteTask,
  getTasks,
  isDueSoon,
  isOverdue,
  updateTask,
} from "@/lib/taskData";
import { getDeals } from "@/lib/dealData";
import { getOrganizations } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { formatDate } from "@/lib/format";
import { useCreateIntent } from "@/lib/create-intent";
import type { Task, TaskPriority } from "@/types/task";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import { cn } from "@/lib/utils";

type View = "all" | "my_tasks" | "overdue" | "due_soon";

const EMPTY: Record<View, { searching: string; idle: string }> = {
  all: { searching: "No tasks found matching your search.", idle: "No tasks yet. Click 'Add Task' to get started." },
  my_tasks: { searching: "No tasks found matching your search.", idle: "No tasks assigned to you." },
  overdue: { searching: "No overdue tasks found matching your search.", idle: "No overdue tasks. You're all caught up!" },
  due_soon: { searching: "No due soon tasks found matching your search.", idle: "No tasks due in the next seven days." },
};

const PRIORITY_RANK: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_LABELS: Record<TaskPriority, string> = { urgent: "Urgent", high: "High", medium: "Medium", low: "Low" };

export function TasksClient() {
  const { user } = useAuth();
  const confirm = useConfirm();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lookups, setLookups] = useState<{
    deals: Map<string, Deal>;
    orgs: Map<string, Organization>;
    people: Map<string, Person>;
  }>({ deals: new Map(), orgs: new Map(), people: new Map() });
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<View>("all");
  const [filters, setFilters] = useState<FilterValues>({});
  const [peekId, setPeekId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useCreateIntent("task", () => setIsModalOpen(true));
  const { sort, setSort } = useRecordTableState({ columnId: "due", direction: "asc" });

  useEffect(() => {
    setTasks(getTasks());
    setLookups({
      deals: new Map(getDeals().map((d) => [d.id, d])),
      orgs: new Map(getOrganizations().map((o) => [o.id, o])),
      people: new Map(getPeople().map((p) => [p.id, p])),
    });
  }, []);

  const change = useCallback((id: string, changes: Partial<Task>, message?: string) => {
    updateTask(id, changes);
    setTasks(getTasks());
    if (message) toast.success(message);
  }, []);

  const toggleDone = (task: Task) => {
    const done = task.status !== "done";
    change(task.id, { status: done ? "done" : "todo", completedAt: done ? new Date().toISOString() : undefined });
    toast.success(done ? `Completed “${task.title}”` : `Reopened “${task.title}”`, {
      action: {
        label: "Undo",
        onClick: () => change(task.id, { status: task.status, completedAt: task.completedAt }),
      },
    });
  };

  const facets: FilterFacet[] = useMemo(
    () => [
      {
        key: "priority",
        label: "Priority",
        options: TASK_PRIORITIES.filter((p) => tasks.some((t) => t.priority === p)).map((p) => PRIORITY_LABELS[p]),
      },
      { key: "assignee", label: "Assignee", options: facetOptions(tasks.map((t) => t.assignee)) },
      { key: "status", label: "Status", options: (["todo", "in_progress", "done"] as const).filter((s) => tasks.some((t) => t.status === s)).map(statusLabel) },
    ],
    [tasks]
  );

  const counts = useMemo(
    () => ({
      overdue: tasks.filter(isOverdue).length,
      dueSoon: tasks.filter(isDueSoon).length,
      mine: user ? tasks.filter((t) => t.assignee === user.fullName && t.status !== "done").length : 0,
    }),
    [tasks, user]
  );

  const visibleTasks = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = (key: string, value: string | undefined) =>
      !filters[key]?.length || (!!value && filters[key].includes(value));
    return tasks.filter((task) => {
      if (term && !task.title.toLowerCase().includes(term)) return false;
      if (view === "overdue" && !isOverdue(task)) return false;
      if (view === "due_soon" && !isDueSoon(task)) return false;
      if (view === "my_tasks" && (!user || task.assignee !== user.fullName)) return false;
      return (
        matches("priority", PRIORITY_LABELS[task.priority]) &&
        matches("assignee", task.assignee) &&
        matches("status", statusLabel(task.status))
      );
    });
  }, [tasks, searchTerm, view, filters, user]);

  const columns: Column<Task>[] = [
    {
      id: "title",
      header: "Task",
      icon: Type,
      width: 360,
      sortValue: (t) => t.title.toLowerCase(),
      cell: (t) => (
        <span className="flex min-w-0 items-center gap-2.5">
          <CompleteToggle task={t} onToggle={() => toggleDone(t)} />
          <span className={cn("truncate font-medium", t.status === "done" && "text-muted-foreground line-through")}>
            {t.title}
          </span>
        </span>
      ),
      footer: (rows) => `${rows.length} ${rows.length === 1 ? "task" : "tasks"}`,
    },
    {
      id: "status",
      header: "Status",
      icon: CircleDashed,
      width: 140,
      sortValue: (t) => ["todo", "in_progress", "done"].indexOf(t.status),
      cell: (t) => (
        <StatusCell
          value={t.status}
          onChange={(status) =>
            change(
              t.id,
              { status, completedAt: status === "done" ? new Date().toISOString() : undefined },
              `Marked “${t.title}” ${statusLabel(status).toLowerCase()}`
            )
          }
        />
      ),
    },
    {
      id: "priority",
      header: "Priority",
      icon: Signal,
      width: 130,
      sortValue: (t) => PRIORITY_RANK[t.priority],
      cell: (t) => (
        <PriorityCell value={t.priority} onChange={(priority) => change(t.id, { priority }, "Priority updated")} />
      ),
    },
    {
      id: "due",
      header: "Due date",
      icon: CalendarDays,
      width: 160,
      sortValue: (t) => t.dueDate || "9999-12-31",
      cell: (t) => {
        if (!t.dueDate) return <span className="text-muted-foreground/60">—</span>;
        const overdue = isOverdue(t);
        return (
          <span className={cn("tabular-nums", overdue && "font-medium text-red-600 dark:text-red-400")}>
            {formatDate(t.dueDate)}
            {overdue && <span className="ml-1 text-xs font-normal">(overdue)</span>}
          </span>
        );
      },
    },
    {
      id: "related",
      header: "Related to",
      icon: Link2,
      width: 220,
      cell: (t) => <RelatedChip related={resolveRelated(t, lookups)} />,
    },
    {
      id: "assignee",
      header: "Assignee",
      icon: UserRound,
      width: 180,
      sortValue: (t) => (t.assignee ?? "").toLowerCase(),
      cell: (t) => (
        <AssigneeCell value={t.assignee} onChange={(assignee) => change(t.id, { assignee }, `Assigned to ${assignee}`)} />
      ),
    },
  ];

  const peekTask = tasks.find((t) => t.id === peekId) ?? null;
  const isSearching = searchTerm !== "" || countFilters(filters) > 0;
  const openCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <RecordListLayout
      title="Tasks"
      description={`${openCount} open · ${counts.overdue} overdue · ${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} in total`}
      actions={
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus />
          Add Task
        </Button>
      }
      toolbar={
        <>
          <Tabs value={view} onValueChange={(value) => setView(value as View)}>
            <TabsList className="h-8 w-auto gap-0.5 rounded-md border border-input bg-muted/60 p-0.5">
              {(
                [
                  ["all", "All", undefined],
                  ["my_tasks", "My Tasks", counts.mine],
                  ["overdue", "Overdue", counts.overdue],
                  ["due_soon", "Due Soon", counts.dueSoon],
                ] as const
              ).map(([value, label, count]) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="mb-0 h-full gap-1.5 rounded-[5px] border-b-0 px-2.5 py-0 text-[13px] data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  {label}
                  {!!count && (
                    <span
                      className={cn(
                        "rounded px-1 text-[11px] tabular-nums",
                        value === "overdue" ? "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" : "bg-background/70 text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <span className="mx-1 h-5 w-px bg-border" />
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search tasks..." />
          <FilterMenu facets={facets} values={filters} onChange={setFilters} />
        </>
      }
    >
      <RecordTable
        rows={visibleTasks}
        columns={columns}
        getRowId={(t) => t.id}
        rowLabel={(t) => t.title}
        sort={sort}
        onSortChange={setSort}
        selectable={false}
        onRowClick={(t) => setPeekId(t.id)}
        rowClassName={(t) => (t.status === "done" ? "opacity-60" : undefined)}
        emptyState={isSearching ? EMPTY[view].searching : EMPTY[view].idle}
      />

      <TaskPeek
        task={peekTask}
        related={peekTask ? resolveRelated(peekTask, lookups) : null}
        onClose={() => setPeekId(null)}
        onChange={(changes, message) => peekTask && change(peekTask.id, changes, message)}
        onToggleDone={() => peekTask && toggleDone(peekTask)}
        onDelete={async () => {
          if (!peekTask) return;
          const ok = await confirm({ title: `Delete “${peekTask.title}”?`, confirmLabel: "Delete task" });
          if (!ok) return;
          deleteTask(peekTask.id);
          setTasks(getTasks());
          setPeekId(null);
          toast.success("Task deleted");
        }}
      />

      <AddTaskModal
        deals={Array.from(lookups.deals.values())}
        organizations={Array.from(lookups.orgs.values())}
        people={Array.from(lookups.people.values())}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={(taskData: Omit<Task, "id" | "createdAt">) => {
          const task = addTask(taskData);
          setTasks(getTasks());
          setIsModalOpen(false);
          toast.success(`Created “${task.title}”`);
        }}
      />
    </RecordListLayout>
  );
}
