"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Plus, ChevronDown, ChevronRight } from "lucide-react";
import type { Task, TaskStatus, TaskPriority } from "@/types/task";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import { getTasks, saveTasks, addTask as addTaskToStore } from "@/lib/taskData";
import { getDeals } from "@/lib/dealData";
import { getOrganizations } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { AddTaskModal } from "@/components/add-task-modal";
import { cn } from "@/lib/utils";
import type { Person } from "@/types/person";

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: "To Do",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  done: {
    label: "Done",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
};

const priorityConfig: Record<
  TaskPriority,
  { label: string; className: string }
> = {
  low: {
    label: "Low",
    className:
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400",
  },
  medium: {
    label: "Medium",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  },
  high: {
    label: "High",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  },
};

function isOverdue(task: Task): boolean {
  if (task.status === "done" || !task.dueDate) return false;
  const today = new Date().toISOString().split("T")[0];
  return task.dueDate < today;
}

function formatDueDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function TasksClient() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    setTasks(getTasks());
    setDeals(getDeals());
    setOrganizations(getOrganizations());
    setPeople(getPeople());
  }, []);

  const orgMap = useMemo(() => {
    const map: Record<string, Organization> = {};
    organizations.forEach((org) => {
      map[org.id] = org;
    });
    return map;
  }, [organizations]);

  const dealMap = useMemo(() => {
    const map: Record<string, Deal> = {};
    deals.forEach((deal) => {
      map[deal.id] = deal;
    });
    return map;
  }, [deals]);

  const personMap = useMemo(() => {
    const map: Record<string, Person> = {};
    people.forEach((person) => {
      map[person.id] = person;
    });
    return map;
  }, [people]);

  const toggleTaskStatus = (taskId: string) => {
    const updated = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const newStatus: TaskStatus = t.status === "done" ? "todo" : "done";
      return {
        ...t,
        status: newStatus,
        completedAt: newStatus === "done" ? new Date().toISOString() : undefined,
      };
    });
    setTasks(updated);
    saveTasks(updated);
  };

  const toggleExpanded = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleAddTask = (
    taskData: Omit<Task, "id" | "createdAt">
  ) => {
    const newTask = addTaskToStore(taskData);
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
  };

  const getRelatedEntity = (task: Task) => {
    if (task.relatedDealId) {
      const deal = dealMap[task.relatedDealId];
      if (deal) {
        return {
          label: deal.title,
          href: `/deals/${deal.id}`,
          type: "Deal",
        };
      }
    }
    if (task.relatedOrganizationId) {
      const org = orgMap[task.relatedOrganizationId];
      if (org) {
        return {
          label: org.name,
          href: `/organizations/${org.id}`,
          type: "Company",
        };
      }
    }
    if (task.relatedPersonId) {
      const person = personMap[task.relatedPersonId];
      if (person) {
        return {
          label: person.name,
          href: `/people/${person.id}`,
          type: "Person",
        };
      }
    }
    return null;
  };

  const sortByDueDate = (a: Task, b: Task) => {
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  };

  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (activeTab === "overdue") {
      filtered = filtered.filter(isOverdue);
    }

    return filtered.sort(sortByDueDate);
  }, [tasks, searchTerm, activeTab]);

  const overdueCount = useMemo(
    () => tasks.filter(isOverdue).length,
    [tasks]
  );

  const renderTaskRow = (task: Task) => {
    const overdue = isOverdue(task);
    const related = getRelatedEntity(task);
    const statusCfg = statusConfig[task.status];
    const priorityCfg = priorityConfig[task.priority];
    const isExpanded = expandedTaskId === task.id;

    return (
      <TableRow
        key={task.id}
        className={cn(
          "group transition-colors",
          task.status === "done" && "opacity-60"
        )}
      >
        <TableCell onClick={(e) => e.stopPropagation()} className="w-10">
          <Checkbox
            checked={task.status === "done"}
            onCheckedChange={() => toggleTaskStatus(task.id)}
            className={cn(
              "data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
            )}
          />
        </TableCell>
        <TableCell className="min-w-[250px]">
          <div>
            <button
              onClick={() => toggleExpanded(task.id)}
              className={cn(
                "flex items-center gap-1.5 text-left font-medium hover:text-orange-600 transition-colors",
                task.status === "done" && "line-through text-muted-foreground"
              )}
            >
              {task.description ? (
                isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                )
              ) : (
                <span className="w-3.5" />
              )}
              {task.title}
            </button>
            {isExpanded && task.description && (
              <p className="text-sm text-muted-foreground mt-1.5 ml-5 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </TableCell>
        <TableCell>
          <Badge
            className={cn(
              "text-xs font-medium border-0",
              statusCfg.className
            )}
          >
            {statusCfg.label}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge
            className={cn(
              "text-xs font-medium border-0",
              priorityCfg.className
            )}
          >
            {priorityCfg.label}
          </Badge>
        </TableCell>
        <TableCell>
          {task.dueDate ? (
            <span
              className={cn(
                "text-sm",
                overdue && "text-red-600 dark:text-red-400 font-medium"
              )}
            >
              {formatDueDate(task.dueDate)}
              {overdue && (
                <span className="ml-1 text-xs text-red-500 dark:text-red-400">
                  (overdue)
                </span>
              )}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">--</span>
          )}
        </TableCell>
        <TableCell>
          {related ? (
            <Link
              href={related.href}
              className="text-sm hover:text-orange-600 transition-colors"
            >
              <span className="text-xs text-muted-foreground mr-1">
                {related.type}:
              </span>
              {related.label}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">--</span>
          )}
        </TableCell>
        <TableCell className="text-sm">{task.assignee}</TableCell>
      </TableRow>
    );
  };

  return (
    <main className="container py-8 max-w-[1400px] mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="my_tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="overdue">
            Overdue
            {overdueCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 text-xs font-medium">
                {overdueCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="mt-4 mb-4">
          <div className="relative max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
            />
          </div>
        </div>

        <TabsContent value="all">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(renderTaskRow)}
            </TableBody>
          </Table>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No tasks found matching your search."
                  : "No tasks yet. Click 'Add Task' to get started."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my_tasks">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(renderTaskRow)}
            </TableBody>
          </Table>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No tasks found matching your search."
                  : "No tasks assigned to you."}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="overdue">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Related</TableHead>
                <TableHead>Assignee</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map(renderTaskRow)}
            </TableBody>
          </Table>
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm
                  ? "No overdue tasks found matching your search."
                  : "No overdue tasks. You're all caught up!"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTask}
        deals={deals}
        organizations={organizations}
        people={people}
      />
    </main>
  );
}
