"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { RecordPeek } from "@/components/record-page/peek";
import { RecordAvatar } from "@/components/record-page/blocks";
import { Timeline } from "@/components/record-page/timeline";
import { StageBadge } from "@/components/stage-badge";
import { StatusDot } from "@/components/record-table/cells";
import { CompanyFields } from "@/components/records/company-fields";
import { DealFields } from "@/components/records/deal-fields";
import { PersonFields } from "@/components/records/person-fields";
import { formatDealValue, getDeal, saveDeal } from "@/lib/dealData";
import {
  getOrganization,
  getOrganizations,
  setOrganizationLists,
  updateOrganization,
} from "@/lib/organizationData";
import { getPerson, updatePerson } from "@/lib/personData";
import { getNotesForOrganization, getNotesForPerson } from "@/lib/notesData";
import { getTasksForDeal, getTasksForOrganization, getTasksForPerson } from "@/lib/taskData";
import { getEmailsForOrganization, getEmails } from "@/lib/emailData";
import { buildTimeline, type TimelineItem } from "@/lib/timeline";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import type { Task } from "@/types/task";
import { CalendarDays, CircleDashed, Link2, Signal, Trash2, Type, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AttributeRow, AttributeSection, InlineText } from "@/components/record-page/attributes";
import { formatDate } from "@/lib/format";
import {
  AssigneeCell,
  CompleteToggle,
  PriorityCell,
  RelatedChip,
  StatusCell,
  StatusPill,
  statusLabel,
  type RelatedRecord,
} from "@/components/records/task-cells";

function RecentActivity({ items }: { items: TimelineItem[] }) {
  return (
    <section className="px-5 py-4">
      <h2 className="mb-3 text-xs font-medium text-muted-foreground">Recent activity</h2>
      <Timeline items={items} limit={4} />
    </section>
  );
}

export function DealPeek({
  dealId,
  onClose,
  onChanged,
}: {
  dealId: string | null;
  onClose: () => void;
  onChanged: (deal: Deal) => void;
}) {
  const [deal, setDeal] = useState<Deal | undefined>();
  const [organization, setOrganization] = useState<Organization | undefined>();
  useEffect(() => {
    const found = dealId ? getDeal(dealId) : undefined;
    setDeal(found);
    setOrganization(found ? getOrganization(found.organizationId) : undefined);
  }, [dealId]);

  const timeline = useMemo(
    () =>
      deal
        ? buildTimeline({
            notes: organization ? getNotesForOrganization(organization.id) : [],
            tasks: getTasksForDeal(deal.id),
            created: { timestamp: deal.createdAt, title: `${deal.owner} created this deal` },
          })
        : [],
    [deal, organization]
  );

  if (!deal) return null;
  return (
    <RecordPeek
      open={!!dealId}
      onOpenChange={(open) => !open && onClose()}
      title={deal.title}
      href={`/deals/${deal.id}`}
      avatar={<RecordAvatar name={organization?.name ?? deal.title} logo={organization?.logo} />}
      subtitle={
        <>
          <StageBadge stage={deal.stage} />
          <span className="font-medium text-foreground">{formatDealValue(deal.value)}</span>
          {organization && <span>{organization.name}</span>}
        </>
      }
    >
      <DealFields
        deal={deal}
        organization={organization}
        onChange={(next, message) => {
          saveDeal(next);
          setDeal(next);
          onChanged(next);
          toast.success(message);
        }}
      />
      <RecentActivity items={timeline} />
    </RecordPeek>
  );
}

export function CompanyPeek({
  companyId,
  onClose,
  onChanged,
}: {
  companyId: string | null;
  onClose: () => void;
  onChanged: (org: Organization) => void;
}) {
  const [org, setOrg] = useState<Organization | undefined>();
  useEffect(() => {
    setOrg(companyId ? getOrganization(companyId) : undefined);
  }, [companyId]);

  const timeline = useMemo(
    () =>
      org
        ? buildTimeline({
            notes: getNotesForOrganization(org.id),
            tasks: getTasksForOrganization(org.id),
            emails: getEmailsForOrganization(org.id),
          })
        : [],
    [org]
  );

  if (!org) return null;
  const apply = (updated: Organization | undefined, message: string) => {
    if (!updated) return;
    setOrg(updated);
    onChanged(updated);
    toast.success(message);
  };
  return (
    <RecordPeek
      open={!!companyId}
      onOpenChange={(open) => !open && onClose()}
      title={org.name}
      href={`/organizations/${org.id}`}
      avatar={<RecordAvatar name={org.name} logo={org.logo} />}
      subtitle={
        <>
          <StageBadge stage={org.dealStage} />
          <span>{org.industry}</span>
        </>
      }
    >
      <CompanyFields
        org={org}
        onChange={(changes, message) => apply(updateOrganization(org.id, changes), message)}
        onListsChange={(listIds) => apply(setOrganizationLists(org.id, listIds), "Lists updated")}
      />
      <RecentActivity items={timeline} />
    </RecordPeek>
  );
}

export function PersonPeek({
  personId,
  onClose,
  onChanged,
}: {
  personId: string | null;
  onClose: () => void;
  onChanged: (person: Person) => void;
}) {
  const [person, setPerson] = useState<Person | undefined>();
  const [organization, setOrganization] = useState<Organization | undefined>();
  useEffect(() => {
    const found = personId ? getPerson(personId) : undefined;
    setPerson(found);
    const name = found?.organization.toLowerCase();
    setOrganization(name ? getOrganizations().find((o) => o.name.toLowerCase() === name) : undefined);
  }, [personId]);

  const timeline = useMemo(() => {
    if (!person) return [];
    const email = person.email.toLowerCase();
    return buildTimeline({
      notes: getNotesForPerson(person.id),
      tasks: getTasksForPerson(person.id),
      emails: getEmails().filter((e) => e.relatedPersonId === person.id || e.to.toLowerCase() === email),
    });
  }, [person]);

  if (!person) return null;
  return (
    <RecordPeek
      open={!!personId}
      onOpenChange={(open) => !open && onClose()}
      title={person.name}
      href={`/people/${person.id}`}
      avatar={
        person.avatar ? (
          <Image src={person.avatar} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full" />
        ) : (
          <RecordAvatar name={person.name} shape="round" />
        )
      }
      subtitle={
        <>
          <StatusDot active={person.status === "Active"} label={person.status} />
          <span>{[person.role, person.organization].filter(Boolean).join(" at ")}</span>
        </>
      }
    >
      <PersonFields
        person={person}
        organization={organization}
        onChange={(changes, message) => {
          const updated = updatePerson(person.id, changes);
          if (!updated) return;
          setPerson(updated);
          onChanged(updated);
          toast.success(message);
        }}
      />
      <RecentActivity items={timeline} />
    </RecordPeek>
  );
}

export function TaskPeek({
  task,
  related,
  onClose,
  onChange,
  onDelete,
}: {
  task: Task | null;
  related: RelatedRecord | null;
  onClose: () => void;
  onChange: (changes: Partial<Task>, message: string) => void;
  onDelete: () => void;
}) {
  if (!task) return null;
  return (
    <RecordPeek
      open={!!task}
      onOpenChange={(open) => !open && onClose()}
      title={task.title}
      avatar={
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <CompleteToggle
            task={task}
            onToggle={() =>
              onChange(
                task.status === "done"
                  ? { status: "todo", completedAt: undefined }
                  : { status: "done", completedAt: new Date().toISOString() },
                task.status === "done" ? "Task reopened" : "Task completed"
              )
            }
          />
        </span>
      }
      subtitle={
        <>
          <StatusPill status={task.status} />
          {task.dueDate && <span>Due {formatDate(task.dueDate)}</span>}
        </>
      }
    >
      <AttributeSection title="Task">
        <AttributeRow icon={Type} label="Title">
          <InlineText label="Title" value={task.title} onSave={(title) => title && onChange({ title }, "Title updated")} />
        </AttributeRow>
        <AttributeRow icon={CircleDashed} label="Status">
          <StatusCell
            value={task.status}
            onChange={(status) =>
              onChange(
                { status, completedAt: status === "done" ? new Date().toISOString() : undefined },
                `Marked ${statusLabel(status).toLowerCase()}`
              )
            }
          />
        </AttributeRow>
        <AttributeRow icon={Signal} label="Priority">
          <PriorityCell value={task.priority} onChange={(priority) => onChange({ priority }, "Priority updated")} />
        </AttributeRow>
        <AttributeRow icon={CalendarDays} label="Due date">
          <InlineText
            label="Due date"
            type="date"
            value={task.dueDate ?? ""}
            format={formatDate}
            onSave={(dueDate) => onChange({ dueDate: dueDate || undefined }, "Due date updated")}
          />
        </AttributeRow>
        <AttributeRow icon={UserRound} label="Assignee">
          <AssigneeCell value={task.assignee} onChange={(assignee) => onChange({ assignee }, `Assigned to ${assignee}`)} />
        </AttributeRow>
        <AttributeRow icon={Link2} label="Related to">
          <span className="block py-1">
            <RelatedChip related={related} />
          </span>
        </AttributeRow>
      </AttributeSection>
      <AttributeSection title="Description">
        <InlineText
          label="Description"
          multiline
          value={task.description ?? ""}
          placeholder="Add details…"
          onSave={(description) => onChange({ description: description || undefined }, "Description updated")}
          className="text-[13px] leading-relaxed"
        />
      </AttributeSection>
      <div className="px-5 py-4">
        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10" onClick={onDelete}>
          <Trash2 />
          Delete task
        </Button>
      </div>
    </RecordPeek>
  );
}
