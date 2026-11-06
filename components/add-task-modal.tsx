"use client";

import { useMemo, useState } from "react";
import { Building2, CircleDollarSign, UserRound } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, Field, FormDialog, type ComboboxOption } from "@/components/form-dialog";
import { Avatar } from "@/components/record-table/cells";
import { PriorityLabel, TASK_PRIORITIES } from "@/components/records/task-cells";
import { ASSIGNEES } from "@/lib/team";
import type { Task, TaskPriority } from "@/types/task";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void;
  deals: Deal[];
  organizations: Organization[];
  people: Person[];
}

const ICON = "h-4 w-4 shrink-0 text-muted-foreground";

export function AddTaskModal({ isOpen, onClose, onAdd, deals, organizations, people }: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  /** "deal:<id>", "company:<id>" or "person:<id>". */
  const [related, setRelated] = useState("");

  const relatedOptions = useMemo<ComboboxOption[]>(
    () => [
      ...deals.map((d) => ({ value: `deal:${d.id}`, label: d.title, keywords: ["deal"], icon: <CircleDollarSign className={ICON} /> })),
      ...organizations.map((o) => ({ value: `company:${o.id}`, label: o.name, keywords: ["company"], icon: <Building2 className={ICON} /> })),
      ...people.map((p) => ({ value: `person:${p.id}`, label: p.name, keywords: ["person", p.organization], icon: <UserRound className={ICON} /> })),
    ],
    [deals, organizations, people]
  );

  const reset = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssignee("");
    setRelated("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    const [kind, id] = related.split(":");
    onAdd({
      title: title.trim(),
      status: "todo",
      priority,
      ...(assignee && { assignee }),
      ...(description.trim() && { description: description.trim() }),
      ...(dueDate && { dueDate }),
      ...(kind === "deal" && { relatedDealId: id }),
      ...(kind === "company" && { relatedOrganizationId: id }),
      ...(kind === "person" && { relatedPersonId: id }),
    });
    reset();
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title="Create Task"
      description="Add a new task to track your work."
      submitLabel="Create Task"
      submitDisabled={!title.trim()}
      onSubmit={submit}
    >
      <Field label="Title" htmlFor="task-title" required wide>
        <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Follow up with client…" autoFocus />
      </Field>
      <Field label="Priority" htmlFor="task-priority">
        <Combobox
          id="task-priority"
          value={priority}
          onChange={(p) => setPriority(p as TaskPriority)}
          options={TASK_PRIORITIES.map((p) => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1), icon: <PriorityLabel priority={p} iconOnly /> }))}
        />
      </Field>
      <Field label="Due Date" htmlFor="task-due-date">
        <Input id="task-due-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </Field>
      <Field label="Assignee" htmlFor="task-assignee">
        <Combobox
          id="task-assignee"
          value={assignee}
          onChange={setAssignee}
          placeholder="Select assignee…"
          allowClear
          options={ASSIGNEES.map((name) => ({ value: name, label: name, icon: <Avatar name={name} /> }))}
        />
      </Field>
      <Field label="Related to" htmlFor="task-related">
        <Combobox
          id="task-related"
          value={related}
          onChange={setRelated}
          placeholder="Deal, company or person…"
          searchPlaceholder="Search records…"
          emptyText="No matching record."
          allowClear
          options={relatedOptions}
        />
      </Field>
      <Field label="Description" htmlFor="task-description" wide>
        <Textarea id="task-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Optional details…" />
      </Field>
    </FormDialog>
  );
}
