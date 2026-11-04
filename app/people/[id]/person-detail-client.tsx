"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Mail, Pencil, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EditPersonModal } from "@/components/edit-person-modal";
import { StageBadge } from "@/components/stage-badge";
import { StatusDot } from "@/components/record-table/cells";
import {
  RecordList,
  RecordListItem,
  RecordPageLayout,
  RecordSection,
} from "@/components/record-page/layout";
import { NoteComposer, Timeline } from "@/components/record-page/timeline";
import {
  NoteList,
  RecordAvatar,
  RecordNotFound,
  StatGrid,
  StatTile,
  TaskList,
} from "@/components/record-page/blocks";
import { PersonFields } from "@/components/records/person-fields";
import { useAuth } from "@/lib/auth-context";
import { getPerson, updatePerson } from "@/lib/personData";
import { getOrganizations } from "@/lib/organizationData";
import { formatDealValue, getDeals } from "@/lib/dealData";
import { addNote, deleteNote, getNotesForPerson, type Note } from "@/lib/notesData";
import { getTasksForPerson, toggleTaskDone } from "@/lib/taskData";
import { getEmails } from "@/lib/emailData";
import { buildTimeline } from "@/lib/timeline";
import { formatDate, formatRelative } from "@/lib/format";
import type { Person } from "@/types/person";
import type { Organization } from "@/types/organization";
import type { Deal } from "@/types/deal";
import type { Task } from "@/types/task";
import type { EmailRecord } from "@/types/email";

export function PersonDetailClient({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const [person, setPerson] = useState<Person | null | undefined>(undefined);
  const [organization, setOrganization] = useState<Organization | undefined>();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const load = useCallback(() => {
    const found = getPerson(params.id) ?? null;
    setPerson(found);
    if (!found) return;
    const orgName = found.organization.toLowerCase();
    setOrganization(getOrganizations().find((org) => org.name.toLowerCase() === orgName));
    setDeals(getDeals().filter((deal) => deal.contactIds?.includes(found.id)));
    setNotes(getNotesForPerson(found.id));
    setTasks(getTasksForPerson(found.id));
    const email = found.email.toLowerCase();
    setEmails(
      getEmails().filter((e) => e.relatedPersonId === found.id || e.to.toLowerCase() === email)
    );
  }, [params.id]);

  useEffect(load, [load]);

  const timeline = useMemo(() => buildTimeline({ notes, tasks, emails }), [notes, tasks, emails]);

  if (person === undefined) return null;
  if (person === null) return <RecordNotFound noun="person" href="/people" label="Back to People" />;

  const update = (changes: Partial<Person>, message: string) => {
    const updated = updatePerson(person.id, changes);
    if (updated) setPerson(updated);
    toast.success(message);
  };

  const handleAddNote = (content: string) => {
    const note = addNote({
      organizationId: organization?.id ?? "",
      personId: person.id,
      content,
      authorName: user?.fullName ?? "You",
    });
    setNotes((prev) => [note, ...prev]);
    toast.success("Note added");
  };

  const handleDeleteNote = (id: string) => {
    deleteNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast.success("Note deleted");
  };

  const handleToggleTask = (task: Task) => {
    const updated = toggleTaskDone(task);
    if (updated) setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  };

  const dealList = (
    <RecordList empty={`${person.name} isn't on any deals yet.`}>
      {deals.map((deal) => (
        <RecordListItem
          key={deal.id}
          href={`/deals/${deal.id}`}
          title={deal.title}
          meta={`${deal.owner} · closes ${formatDate(deal.expectedCloseDate)}`}
          trailing={
            <span className="flex items-center gap-3">
              <StageBadge stage={deal.stage} />
              <span className="w-14 font-medium tabular-nums">{formatDealValue(deal.value)}</span>
            </span>
          }
        />
      ))}
    </RecordList>
  );

  const emailList = (
    <RecordList empty="No emails yet.">
      {emails.map((email) => (
        <RecordListItem
          key={email.id}
          href="/emails"
          leading={<Mail className="h-4 w-4 shrink-0 text-muted-foreground" />}
          title={email.subject}
          meta={`To ${email.toName || email.to} · ${email.status}`}
          trailing={<span className="text-xs text-muted-foreground">{formatRelative(email.sentAt)}</span>}
        />
      ))}
    </RecordList>
  );

  const avatar = person.avatar ? (
    <Image src={person.avatar} alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-full" />
  ) : (
    <RecordAvatar name={person.name} shape="round" />
  );

  return (
    <>
      <RecordPageLayout
        parent={{ label: "People", href: "/people" }}
        title={person.name}
        avatar={avatar}
        subtitle={
          <>
            <StatusDot active={person.status === "Active"} label={person.status} />
            {[person.role, person.organization].filter(Boolean).length > 0 && (
              <span>{[person.role, person.organization].filter(Boolean).join(" at ")}</span>
            )}
          </>
        }
        actions={
          <>
            {person.phone && (
              <Button variant="outline" asChild>
                <a href={`tel:${person.phone}`}>
                  <Phone />
                  Call
                </a>
              </Button>
            )}
            <Button variant="outline" asChild>
              <a href={`mailto:${person.email}`}>
                <Mail />
                Email
              </a>
            </Button>
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil />
              Edit
            </Button>
          </>
        }
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <>
                <StatGrid>
                  <StatTile label="Deals" value={deals.length} />
                  <StatTile
                    label="Pipeline"
                    value={formatDealValue(deals.reduce((sum, d) => sum + d.value, 0))}
                  />
                  <StatTile label="Emails" value={emails.length} />
                  <StatTile label="Last contact" value={person.lastContact ? formatDate(person.lastContact) : "—"} />
                </StatGrid>
                <RecordSection title="Deals">{dealList}</RecordSection>
                <RecordSection title="Open tasks">
                  <TaskList tasks={tasks.filter((t) => t.status !== "done")} onToggle={handleToggleTask} />
                </RecordSection>
                <RecordSection title="Recent activity">
                  <Timeline items={timeline} limit={5} />
                </RecordSection>
              </>
            ),
          },
          { id: "activity", label: "Activity", count: timeline.length, content: <Timeline items={timeline} /> },
          {
            id: "notes",
            label: "Notes",
            count: notes.length,
            content: (
              <>
                <NoteComposer onSave={handleAddNote} placeholder={`Write a note about ${person.name}…`} />
                <NoteList notes={notes} onDelete={handleDeleteNote} />
              </>
            ),
          },
          { id: "emails", label: "Emails", count: emails.length, content: emailList },
          { id: "deals", label: "Deals", count: deals.length, content: dealList },
        ]}
        sidebar={<PersonFields person={person} organization={organization} onChange={update} />}
      />

      <EditPersonModal
        isOpen={isEditOpen}
        person={person}
        onClose={() => setIsEditOpen(false)}
        onSave={(updated) => {
          update(updated, `Saved ${updated.name}`);
          setIsEditOpen(false);
          load();
        }}
      />
    </>
  );
}
