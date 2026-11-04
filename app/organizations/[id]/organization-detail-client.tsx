"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Globe, MapPin, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditOrganizationModal } from "@/components/edit-organization-modal";
import { StageBadge } from "@/components/stage-badge";
import { Avatar } from "@/components/record-table/cells";
import {
  RecordList,
  RecordListItem,
  RecordPageLayout,
  RecordSection,
} from "@/components/record-page/layout";
import { InlineText } from "@/components/record-page/attributes";
import { NoteComposer, Timeline } from "@/components/record-page/timeline";
import {
  NoteList,
  RecordAvatar,
  RecordNotFound,
  StatGrid,
  StatTile,
  TaskList,
} from "@/components/record-page/blocks";
import { CompanyFields } from "@/components/records/company-fields";
import { useAuth } from "@/lib/auth-context";
import {
  deleteOrganization,
  getOrganization,
  setOrganizationLists,
  updateOrganization,
} from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { formatDealValue, getDealsForOrganization } from "@/lib/dealData";
import { addNote, deleteNote, getNotesForOrganization, type Note } from "@/lib/notesData";
import { getTasksForOrganization, toggleTaskDone } from "@/lib/taskData";
import { getEmailsForOrganization } from "@/lib/emailData";
import { getActivities } from "@/lib/activityData";
import { buildTimeline } from "@/lib/timeline";
import { formatDate } from "@/lib/format";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import type { Deal } from "@/types/deal";
import type { Task } from "@/types/task";
import type { EmailRecord } from "@/types/email";
import type { Activity } from "@/types/activity";

const CLOSED_STAGES = new Set(["Customer", "Closed Lost", "Churned"]);

export function OrganizationDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null | undefined>(undefined);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const load = useCallback(() => {
    const org = getOrganization(params.id) ?? null;
    setOrganization(org);
    if (!org) return;
    const name = org.name.toLowerCase();
    setContacts(getPeople().filter((p) => p.organization.toLowerCase() === name));
    setDeals(getDealsForOrganization(org.id));
    setNotes(getNotesForOrganization(org.id));
    setTasks(getTasksForOrganization(org.id));
    setEmails(getEmailsForOrganization(org.id));
    setActivities(
      getActivities().filter(
        (a) =>
          (a.relatedEntityType === "organization" && a.relatedEntityId === org.id) ||
          a.description?.toLowerCase().includes(name)
      )
    );
  }, [params.id]);

  useEffect(load, [load]);

  const timeline = useMemo(
    () => buildTimeline({ notes, tasks, emails, activities }),
    [notes, tasks, emails, activities]
  );

  if (organization === undefined) return null;
  if (organization === null) {
    return <RecordNotFound noun="company" href="/organizations" label="Back to Companies" />;
  }

  const update = (changes: Partial<Organization>, message: string) => {
    const updated = updateOrganization(organization.id, changes);
    if (updated) setOrganization(updated);
    toast.success(message);
  };

  const handleDelete = () => {
    if (!confirm(`Delete ${organization.name}? This can't be undone.`)) return;
    deleteOrganization(organization.id);
    toast.success(`Deleted ${organization.name}`);
    router.push("/organizations");
  };

  const handleAddNote = (content: string) => {
    const note = addNote({
      organizationId: organization.id,
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

  const openDeals = deals.filter((d) => !CLOSED_STAGES.has(d.stage));
  const openValue = openDeals.reduce((sum, d) => sum + d.value, 0);
  const website = organization.website_url?.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const dealList = (
    <RecordList empty="No deals with this company yet.">
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

  const peopleList = (
    <RecordList empty="No people at this company yet.">
      {contacts.map((person) => (
        <RecordListItem
          key={person.id}
          href={`/people/${person.id}`}
          leading={<Avatar name={person.name} size={24} />}
          title={person.name}
          meta={person.role}
          trailing={<span className="text-muted-foreground">{person.email}</span>}
        />
      ))}
    </RecordList>
  );

  return (
    <>
      <RecordPageLayout
        parent={{ label: "Companies", href: "/organizations" }}
        title={organization.name}
        avatar={<RecordAvatar name={organization.name} logo={organization.logo} />}
        subtitle={
          <>
            <StageBadge stage={organization.dealStage} />
            {organization.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {organization.location}
              </span>
            )}
            {website && (
              <a
                href={organization.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-foreground"
              >
                <Globe className="h-3.5 w-3.5" />
                {website}
              </a>
            )}
          </>
        }
        actions={
          <>
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil />
              Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="More actions">
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={handleDelete} className="text-[13px] text-red-600 focus:text-red-600">
                  <Trash2 />
                  Delete company
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
                  <StatTile label="Open pipeline" value={formatDealValue(openValue)} hint={`${openDeals.length} open deals`} />
                  <StatTile label="Deals" value={deals.length} />
                  <StatTile label="People" value={contacts.length} />
                  <StatTile
                    label="Last contacted"
                    value={organization.lastContacted ? formatDate(organization.lastContacted) : "—"}
                  />
                </StatGrid>
                <RecordSection title="About">
                  <InlineText
                    label="About"
                    multiline
                    value={organization.description ?? ""}
                    placeholder="Add a description…"
                    onSave={(description) => update({ description }, "Description updated")}
                    className="text-[13px] leading-relaxed"
                  />
                </RecordSection>
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
                <NoteComposer onSave={handleAddNote} placeholder={`Write a note about ${organization.name}…`} />
                <NoteList notes={notes} onDelete={handleDeleteNote} />
              </>
            ),
          },
          { id: "deals", label: "Deals", count: deals.length, content: dealList },
          { id: "people", label: "People", count: contacts.length, content: peopleList },
          {
            id: "tasks",
            label: "Tasks",
            count: tasks.filter((t) => t.status !== "done").length,
            content: <TaskList tasks={tasks} onToggle={handleToggleTask} />,
          },
        ]}
        sidebar={
          <CompanyFields
            org={organization}
            onChange={update}
            onListsChange={(listIds) => {
              const updated = setOrganizationLists(organization.id, listIds);
              if (updated) setOrganization(updated);
              toast.success("Lists updated");
            }}
          />
        }
      />

      <EditOrganizationModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        organization={organization}
        onEdit={(updatedOrg) => {
          update(updatedOrg, `Saved ${updatedOrg.name}`);
          setIsEditOpen(false);
          load();
        }}
        onDelete={() => {
          deleteOrganization(organization.id);
          toast.success(`Deleted ${organization.name}`);
          router.push("/organizations");
        }}
      />
    </>
  );
}
