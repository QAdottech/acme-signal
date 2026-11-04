"use client";

import Link from "next/link";
import { CheckCircle2, Circle, SearchX, Trash2 } from "lucide-react";
import { OrganizationImage } from "@/components/organization-image";
import { Button } from "@/components/ui/button";
import { formatDate, formatRelative } from "@/lib/format";
import { avatarColor, getInitials } from "@/lib/team";
import type { Note } from "@/lib/notesData";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

/** 40px identity mark in record headers: a logo, or initials. */
export function RecordAvatar({
  name,
  logo,
  shape = "square",
}: {
  name: string;
  logo?: string;
  shape?: "square" | "round";
}) {
  const radius = shape === "round" ? "rounded-full" : "rounded-lg";
  if (logo) {
    return (
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border bg-background", radius)}>
        <OrganizationImage src={logo} alt="" width={40} height={40} className={radius} />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center text-sm font-semibold text-white",
        radius,
        avatarColor(name)
      )}
    >
      {getInitials(name)}
    </span>
  );
}

/** Small headline number at the top of an Overview tab. */
export function StatTile({ label, value, hint }: { label: string; value: React.ReactNode; hint?: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-background px-4 py-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums tracking-tight">{value}</div>
      {hint && <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function StatGrid({ children }: { children: React.ReactNode }) {
  return <div className="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">{children}</div>;
}

export function NoteList({ notes, onDelete }: { notes: Note[]; onDelete?: (id: string) => void }) {
  if (notes.length === 0) {
    return <p className="py-6 text-center text-[13px] text-muted-foreground">No notes yet.</p>;
  }
  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="group rounded-lg border bg-background px-4 py-3">
          <div className="mb-1.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{note.authorName}</span> · {formatRelative(note.createdAt)}
            </span>
            {onDelete && (
              <button
                type="button"
                aria-label="Delete note"
                onClick={() => onDelete(note.id)}
                className="flex h-6 w-6 items-center justify-center rounded opacity-0 transition hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed">{note.content}</p>
        </li>
      ))}
    </ul>
  );
}

const PRIORITY_STYLES: Record<Task["priority"], string> = {
  low: "text-muted-foreground",
  medium: "text-sky-700 dark:text-sky-300",
  high: "text-amber-700 dark:text-amber-300",
  urgent: "text-red-700 dark:text-red-300",
};

export function TaskList({ tasks, onToggle }: { tasks: Task[]; onToggle: (task: Task) => void }) {
  if (tasks.length === 0) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
        No tasks.
      </p>
    );
  }
  const today = new Date().toISOString().split("T")[0];
  return (
    <ul className="divide-y overflow-hidden rounded-lg border">
      {tasks.map((task) => {
        const done = task.status === "done";
        const overdue = !done && !!task.dueDate && task.dueDate < today;
        return (
          <li key={task.id} className="flex items-center gap-3 px-3 py-2.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={done}
              aria-label={`${done ? "Reopen" : "Complete"} ${task.title}`}
              onClick={() => onToggle(task)}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              {done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4" />}
            </button>
            <span className={cn("min-w-0 flex-1 truncate text-[13px]", done && "text-muted-foreground line-through")}>
              {task.title}
            </span>
            <span className={cn("shrink-0 text-xs capitalize", PRIORITY_STYLES[task.priority])}>{task.priority}</span>
            {task.dueDate && (
              <span className={cn("w-16 shrink-0 text-right text-xs tabular-nums", overdue ? "font-medium text-red-600" : "text-muted-foreground")}>
                {formatDate(task.dueDate)}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function RecordNotFound({ noun, href, label }: { noun: string; href: string; label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
      <SearchX className="h-8 w-8 text-muted-foreground" />
      <h1 className="text-lg font-semibold">This {noun} doesn&apos;t exist</h1>
      <p className="max-w-sm text-[13px] text-muted-foreground">It may have been deleted, or the link is wrong.</p>
      <Button asChild variant="outline">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
