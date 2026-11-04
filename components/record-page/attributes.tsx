"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** A titled group of fields in the record sidebar. */
export function AttributeSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="border-b px-5 py-4 last:border-b-0">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xs font-medium text-muted-foreground">{title}</h2>
        {action}
      </div>
      <dl className="space-y-0.5">{children}</dl>
    </section>
  );
}

/** One field: icon + label on the left, the (often editable) value on the right. */
export function AttributeRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-8 grid-cols-[120px_minmax(0,1fr)] items-center gap-2 text-[13px]">
      <dt className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  );
}

/**
 * Click-to-edit value. Shows as plain text; on click becomes an input.
 * Enter or blur saves, Escape cancels.
 */
export function InlineText({
  label,
  value,
  onSave,
  type = "text",
  placeholder = "Add…",
  format,
  multiline = false,
  className,
}: {
  label: string;
  value: string;
  onSave: (value: string) => void;
  type?: "text" | "number" | "date" | "email" | "url";
  placeholder?: string;
  /** Display transform, e.g. currency formatting. */
  format?: (value: string) => React.ReactNode;
  multiline?: boolean;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    if (draft.trim() !== value.trim()) onSave(draft.trim());
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  if (editing) {
    const shared = {
      ref: inputRef,
      "aria-label": label,
      value: draft,
      onBlur: commit,
      className:
        "w-full rounded-md border border-ring bg-background px-1.5 py-1 text-[13px] outline-none ring-2 ring-ring/20",
    };
    return multiline ? (
      <textarea
        {...shared}
        rows={3}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
          if (e.key === "Escape") cancel();
        }}
      />
    ) : (
      <input
        {...shared}
        type={type}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") cancel();
        }}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      aria-label={`${label}: ${value || "empty"}. Edit ${label.toLowerCase()}`}
      className={cn(
        "-mx-1.5 block w-[calc(100%+0.75rem)] rounded px-1.5 py-1 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
        multiline ? "whitespace-pre-wrap" : "truncate",
        className
      )}
    >
      {value ? (format ? format(value) : value) : <span className="text-muted-foreground/70">{placeholder}</span>}
    </button>
  );
}
