"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Clock, FileSignature, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SendForSignatureModal } from "@/components/send-for-signature-modal";
import { StageBadge } from "@/components/stage-badge";
import { Avatar } from "@/components/record-table/cells";
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
import { DealFields } from "@/components/records/deal-fields";
import { useAuth } from "@/lib/auth-context";
import { deleteDeal, formatDealValue, getDeal, saveDeal } from "@/lib/dealData";
import { getOrganization } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { addNote, deleteNote, getNotesForOrganization, type Note } from "@/lib/notesData";
import { getTasksForDeal, toggleTaskDone } from "@/lib/taskData";
import { buildTimeline } from "@/lib/timeline";
import { getDealContext } from "@/lib/deal-context";
import { formatDate } from "@/lib/format";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import type { Task } from "@/types/task";
import { useConfirm } from "@/components/confirm-dialog";

export function DealDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const confirm = useConfirm();
  const [deal, setDeal] = useState<Deal | null | undefined>(undefined);
  const [organization, setOrganization] = useState<Organization | undefined>();
  const [contacts, setContacts] = useState<Person[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [signatureOpen, setSignatureOpen] = useState(false);

  const load = useCallback(() => {
    const found = getDeal(params.id) ?? null;
    setDeal(found);
    if (!found) return;
    const org = getOrganization(found.organizationId);
    setOrganization(org);
    // Deal notes live on the company, so the deal shows the company's notes.
    setNotes(org ? getNotesForOrganization(org.id) : []);
    setTasks(getTasksForDeal(found.id));
    const people = getPeople();
    setContacts(
      (found.contactIds ?? [])
        .map((id) => people.find((p) => p.id === id))
        .filter((p): p is Person => !!p)
    );
  }, [params.id]);

  useEffect(load, [load]);

  const timeline = useMemo(
    () =>
      deal
        ? buildTimeline({
            notes,
            tasks,
            ...getDealContext(deal),
            created: { timestamp: deal.createdAt, title: `${deal.owner} created this deal` },
          })
        : [],
    [deal, notes, tasks]
  );

  if (deal === undefined) return null;
  if (deal === null) return <RecordNotFound noun="deal" href="/deals" label="Back to Deals" />;

  const change = (next: Deal, message: string) => {
    saveDeal(next);
    setDeal(next);
    toast.success(message);
  };

  const handleDelete = async () => {
    if (!(await confirm({ title: `Delete “${deal.title}”?`, confirmLabel: "Delete deal" }))) return;
    deleteDeal(deal.id);
    toast.success(`Deleted “${deal.title}”`);
    router.push("/deals");
  };

  const handleAddNote = (content: string) => {
    if (!organization) return;
    const note = addNote({
      organizationId: organization.id,
      dealId: deal.id,
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

  const handleSignatureSent = (recipientEmail: string) => {
    change(
      {
        ...deal,
        signatureStatus: "sent",
        signatureSentAt: new Date().toISOString(),
        signatureRecipientEmail: recipientEmail,
      },
      `Proposal sent to ${recipientEmail}`
    );
  };

  const signature = (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-4 py-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileSignature className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1 text-[13px]">
        {deal.signatureStatus === "signed" ? (
          <span className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Signed
          </span>
        ) : deal.signatureStatus === "sent" ? (
          <>
            <span className="flex items-center gap-1.5 font-medium text-amber-700 dark:text-amber-300">
              <Clock className="h-4 w-4" /> Awaiting signature
            </span>
            <span className="text-xs text-muted-foreground">
              Sent to {deal.signatureRecipientEmail}
              {deal.signatureSentAt && ` on ${formatDate(deal.signatureSentAt)}`}
            </span>
          </>
        ) : (
          <>
            <span className="font-medium">Proposal not sent</span>
            <span className="block text-xs text-muted-foreground">Send the proposal for e-signature when terms are agreed.</span>
          </>
        )}
      </div>
      {deal.signatureStatus !== "signed" && organization && (
        <Button variant="outline" size="sm" onClick={() => setSignatureOpen(true)}>
          <Send />
          {deal.signatureStatus === "sent" ? "Resend" : "Send"}
        </Button>
      )}
    </div>
  );

  const contactList = (
    <RecordList empty="No contacts linked to this deal.">
      {contacts.map((person) => (
        <RecordListItem
          key={person.id}
          href={`/people/${person.id}`}
          leading={<Avatar name={person.name} size={24} />}
          title={person.name}
          meta={[person.role, person.organization].filter(Boolean).join(" · ")}
          trailing={<span className="text-muted-foreground">{person.email}</span>}
        />
      ))}
    </RecordList>
  );

  return (
    <>
      <RecordPageLayout
        parent={{ label: "Deals", href: "/deals" }}
        title={deal.title}
        avatar={<RecordAvatar name={organization?.name ?? deal.title} logo={organization?.logo} />}
        subtitle={
          <>
            <StageBadge stage={deal.stage} />
            <span className="font-medium text-foreground">{formatDealValue(deal.value)}</span>
            {organization && <span>{organization.name}</span>}
            {deal.expectedCloseDate && <span>Closes {formatDate(deal.expectedCloseDate)}</span>}
          </>
        }
        actions={
          <>
            {organization && (
              <Button variant="outline" onClick={() => setSignatureOpen(true)}>
                <Send />
                Send for Signature
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleDelete} className="text-[13px] text-red-600 focus:text-red-600">
                  <Trash2 />
                  Delete deal
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
        tabs={[
          {
            id: "overview",
            label: "Overview",
            content: (
              <>
                <StatGrid>
                  <StatTile label="Value" value={formatDealValue(deal.value)} />
                  <StatTile
                    label="Weighted"
                    value={formatDealValue((deal.value * deal.probability) / 100)}
                    hint={`${deal.probability}% probability`}
                  />
                  <StatTile label="Close date" value={deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : "—"} />
                  <StatTile label="Owner" value={<span className="text-base">{deal.owner}</span>} />
                </StatGrid>
                <RecordSection title="Signature">{signature}</RecordSection>
                <RecordSection title="Contacts">{contactList}</RecordSection>
                <RecordSection title="Tasks">
                  <TaskList tasks={tasks} onToggle={handleToggleTask} />
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
                {organization && (
                  <NoteComposer onSave={handleAddNote} placeholder={`Write a note about ${deal.title}…`} />
                )}
                <NoteList notes={notes} onDelete={handleDeleteNote} />
              </>
            ),
          },
          {
            id: "tasks",
            label: "Tasks",
            count: tasks.filter((t) => t.status !== "done").length,
            content: <TaskList tasks={tasks} onToggle={handleToggleTask} />,
          },
        ]}
        sidebar={<DealFields deal={deal} organization={organization} onChange={change} />}
      />

      {organization && (
        <SendForSignatureModal
          isOpen={signatureOpen}
          onClose={() => setSignatureOpen(false)}
          deal={deal}
          organization={organization}
          onSent={handleSignatureSent}
        />
      )}
    </>
  );
}
