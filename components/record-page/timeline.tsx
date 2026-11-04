"use client";

import { useState } from "react";
import { Activity, CheckCircle2, Circle, Mail, Sparkles, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { formatRelative, formatFullDate } from "@/lib/format";
import type { TimelineItem, TimelineKind } from "@/lib/timeline";
import { cn } from "@/lib/utils";

const KIND_STYLES: Record<TimelineKind, { icon: React.ComponentType<{ className?: string }>; tint: string }> = {
  note: { icon: StickyNote, tint: "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300" },
  task: { icon: Circle, tint: "bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300" },
  email: { icon: Mail, tint: "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300" },
  activity: { icon: Activity, tint: "bg-muted text-muted-foreground" },
  created: { icon: Sparkles, tint: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" },
};

/** Newest-first activity feed for a record. */
export function Timeline({
  items,
  limit,
  empty = "Nothing has happened here yet.",
}: {
  items: TimelineItem[];
  limit?: number;
  empty?: string;
}) {
  const shown = limit ? items.slice(0, limit) : items;
  if (shown.length === 0) {
    return <p className="py-6 text-center text-[13px] text-muted-foreground">{empty}</p>;
  }
  return (
    <ol className="relative">
      {shown.map((item, index) => {
        const style = KIND_STYLES[item.kind];
        const Icon = item.kind === "task" && item.done ? CheckCircle2 : style.icon;
        const last = index === shown.length - 1;
        return (
          <li key={item.id} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span aria-hidden className="absolute left-[13px] top-7 h-[calc(100%-1.5rem)] w-px bg-border" />}
            <span className={cn("relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full", style.tint)}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="min-w-0 text-[13px] font-medium">{item.title}</p>
                <time
                  dateTime={item.timestamp}
                  title={formatFullDate(item.timestamp)}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatRelative(item.timestamp)}
                </time>
              </div>
              {item.body && (
                <p
                  className={cn(
                    "mt-1 text-[13px] text-muted-foreground",
                    item.kind === "note" &&
                      "whitespace-pre-wrap rounded-md border bg-background px-3 py-2 text-foreground"
                  )}
                >
                  {item.body}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Inline note editor used at the top of a record's Notes tab. */
export function NoteComposer({
  onSave,
  placeholder = "Write a note…",
}: {
  onSave: (content: string) => void;
  placeholder?: string;
}) {
  const [content, setContent] = useState("");
  const [focused, setFocused] = useState(false);
  const save = () => {
    if (!content.trim()) return;
    onSave(content.trim());
    setContent("");
  };
  return (
    <div className="mb-6 rounded-lg border bg-background shadow-sm focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      <Textarea
        aria-label="New note"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) save();
        }}
        placeholder={placeholder}
        rows={focused || content ? 3 : 1}
        className="resize-none border-0 shadow-none focus-visible:ring-0"
      />
      {(focused || content) && (
        <div className="flex items-center justify-between border-t px-2.5 py-1.5">
          <span className="text-xs text-muted-foreground">⌘/Ctrl + Enter to save</span>
          <Button size="sm" onMouseDown={(e) => e.preventDefault()} onClick={save} disabled={!content.trim()}>
            Save note
          </Button>
        </div>
      )}
    </div>
  );
}
