"use client";

import Link from "next/link";
import { Building2, CheckCircle2, Circle, CircleDollarSign, UserRound } from "lucide-react";
import { InlineSelect, PersonChip } from "@/components/record-table/cells";
import { ASSIGNEES } from "@/lib/team";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import { cn } from "@/lib/utils";

export const TASK_STATUSES: TaskStatus[] = ["todo", "in_progress", "done"];
export const TASK_PRIORITIES: TaskPriority[] = ["urgent", "high", "medium", "low"];

const STATUS_META: Record<TaskStatus, { label: string; className: string }> = {
  todo: { label: "To Do", className: "bg-muted text-muted-foreground" },
  in_progress: { label: "In Progress", className: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300" },
  done: { label: "Done", className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
};

const PRIORITY_META: Record<TaskPriority, { label: string; bars: number; className: string }> = {
  urgent: { label: "Urgent", bars: 4, className: "text-red-600 dark:text-red-400" },
  high: { label: "High", bars: 3, className: "text-amber-600 dark:text-amber-400" },
  medium: { label: "Medium", bars: 2, className: "text-sky-600 dark:text-sky-400" },
  low: { label: "Low", bars: 1, className: "text-muted-foreground" },
};

export function statusLabel(status: TaskStatus) {
  return STATUS_META[status].label;
}

export function StatusPill({ status }: { status: TaskStatus }) {
  const meta = STATUS_META[status];
  return (
    <span className={cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium", meta.className)}>
      {meta.label}
    </span>
  );
}

/** Priority as signal bars plus a label, so it reads at a glance without colour alone. */
export function PriorityLabel({ priority, iconOnly }: { priority: TaskPriority; iconOnly?: boolean }) {
  const meta = PRIORITY_META[priority];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px]", meta.className)}>
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[1, 2, 3, 4].map((bar) => (
          <span
            key={bar}
            className={cn("w-[3px] rounded-sm", bar <= meta.bars ? "bg-current" : "bg-current opacity-20")}
            style={{ height: `${bar * 3}px` }}
          />
        ))}
      </span>
      {!iconOnly && <span className={priority === "low" ? "" : "text-foreground"}>{meta.label}</span>}
    </span>
  );
}

export function StatusCell({ value, onChange }: { value: TaskStatus; onChange: (status: TaskStatus) => void }) {
  return (
    <InlineSelect
      label="Status"
      value={value}
      options={TASK_STATUSES}
      onChange={onChange}
      renderValue={(status) => (status ? <StatusPill status={status} /> : null)}
      renderOption={(status) => <StatusPill status={status} />}
    />
  );
}

export function PriorityCell({ value, onChange }: { value: TaskPriority; onChange: (p: TaskPriority) => void }) {
  return (
    <InlineSelect
      label="Priority"
      value={value}
      options={TASK_PRIORITIES}
      onChange={onChange}
      renderValue={(priority) => (priority ? <PriorityLabel priority={priority} /> : null)}
      renderOption={(priority) => <PriorityLabel priority={priority} />}
    />
  );
}

export function AssigneeCell({ value, onChange }: { value?: string; onChange: (name: string) => void }) {
  return (
    <InlineSelect
      label="Assignee"
      value={value}
      options={ASSIGNEES}
      onChange={onChange}
      renderValue={(name) => (name ? <PersonChip name={name} /> : <span className="text-muted-foreground/60">—</span>)}
      renderOption={(name) => <PersonChip name={name} />}
    />
  );
}

/** The circle that completes a task. Acts as the row's checkbox. */
export function CompleteToggle({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const done = task.status === "done";
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={`${done ? "Reopen" : "Complete"} ${task.title}`}
      onClick={onToggle}
      className={cn(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        done ? "text-emerald-600" : "text-muted-foreground/70 hover:text-foreground"
      )}
    >
      {done ? <CheckCircle2 className="h-[18px] w-[18px]" /> : <Circle className="h-[18px] w-[18px]" />}
    </button>
  );
}

export type RelatedRecord = { type: "Deal" | "Company" | "Person"; label: string; href: string };

export function resolveRelated(
  task: Task,
  lookups: { deals: Map<string, Deal>; orgs: Map<string, Organization>; people: Map<string, Person> }
): RelatedRecord | null {
  const deal = task.relatedDealId ? lookups.deals.get(task.relatedDealId) : undefined;
  if (deal) return { type: "Deal", label: deal.title, href: `/deals/${deal.id}` };
  const org = task.relatedOrganizationId ? lookups.orgs.get(task.relatedOrganizationId) : undefined;
  if (org) return { type: "Company", label: org.name, href: `/organizations/${org.id}` };
  const person = task.relatedPersonId ? lookups.people.get(task.relatedPersonId) : undefined;
  if (person) return { type: "Person", label: person.name, href: `/people/${person.id}` };
  return null;
}

const RELATED_ICONS = { Deal: CircleDollarSign, Company: Building2, Person: UserRound };

export function RelatedChip({ related }: { related: RelatedRecord | null }) {
  if (!related) return <span className="text-muted-foreground/60">—</span>;
  const Icon = RELATED_ICONS[related.type];
  return (
    <Link prefetch={false}
      href={related.href}
      title={`${related.type}: ${related.label}`}
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border bg-background px-1.5 py-0.5 text-[13px] hover:bg-accent"
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <span className="sr-only">{related.type}: </span>
      <span className="truncate">{related.label}</span>
    </Link>
  );
}
