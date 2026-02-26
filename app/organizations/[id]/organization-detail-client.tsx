"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditOrganizationModal } from "@/components/edit-organization-modal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import type { Activity } from "@/types/activity";
import type { Note } from "@/lib/notesData";
import type { Deal } from "@/types/deal";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Globe,
  Users,
  MapPin,
  ChevronsUpDown,
  Check,
  Mail,
  Phone,
  Linkedin,
  Building2,
  ArrowRight,
  StickyNote,
  Calendar,
  FolderKanban,
  Trash2,
  Send,
  TrendingUp,
} from "lucide-react";
import { CollectionManager } from "@/components/collection-manager";
import { deduplicateCollectionOrganizationIds } from "@/lib/organizationData";
import { OrganizationImage } from "@/components/organization-image";
import { getPeople } from "@/lib/personData";
import { getActivities } from "@/lib/activityData";
import {
  getNotesForOrganization,
  addNote,
  deleteNote,
} from "@/lib/notesData";
import { getDealsForOrganization, formatDealValue } from "@/lib/dealData";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const dealStages = [
  "New",
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Customer",
  "Churned",
  "Closed Lost",
] as const;

const activityIcons: Record<string, typeof Building2> = {
  organization_added: Building2,
  person_added: Users,
  collection_created: FolderKanban,
  stage_changed: ArrowRight,
  note_added: StickyNote,
  meeting_scheduled: Calendar,
  deal_updated: TrendingUp,
  email_sent: Mail,
};

const activityColors: Record<string, string> = {
  organization_added: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  person_added: "text-green-500 bg-green-50 dark:bg-green-950",
  collection_created: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  stage_changed: "text-orange-500 bg-orange-50 dark:bg-orange-950",
  note_added: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  meeting_scheduled: "text-pink-500 bg-pink-50 dark:bg-pink-950",
  deal_updated: "text-amber-500 bg-amber-50 dark:bg-amber-950",
  email_sent: "text-teal-500 bg-teal-50 dark:bg-teal-950",
};

function getTimeAgo(timestamp: string) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

export function OrganizationDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [contacts, setContacts] = useState<Person[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [newNote, setNewNote] = useState("");
  const router = useRouter();

  useEffect(() => {
    deduplicateCollectionOrganizationIds();
    const storedOrganizations = localStorage.getItem("organizations");
    if (storedOrganizations) {
      const organizations: Organization[] = JSON.parse(storedOrganizations);
      const org = organizations.find((o) => o.id === params.id);
      if (org) {
        setOrganization(org);
        // Load related contacts
        const allPeople = getPeople();
        setContacts(
          allPeople.filter((p) => p.organization === org.name)
        );
        // Load activities related to this org
        const allActivities = getActivities();
        setActivities(
          allActivities.filter(
            (a) =>
              a.relatedEntityId === params.id ||
              a.description?.toLowerCase().includes(org.name.toLowerCase())
          )
        );
        // Load notes
        setNotes(getNotesForOrganization(params.id));
        setDeals(getDealsForOrganization(params.id));
      } else {
        router.push("/organizations");
      }
    }
  }, [params.id, router]);

  const handleEdit = (updatedOrg: Organization) => {
    const storedOrganizations = localStorage.getItem("organizations");
    if (storedOrganizations) {
      const organizations: Organization[] = JSON.parse(storedOrganizations);
      const updatedOrganizations = organizations.map((org) =>
        org.id === updatedOrg.id ? updatedOrg : org
      );
      localStorage.setItem(
        "organizations",
        JSON.stringify(updatedOrganizations)
      );
      setOrganization(updatedOrg);
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = (organizationId: string) => {
    const storedOrganizationsString = localStorage.getItem("organizations");
    if (storedOrganizationsString) {
      const organizations: Organization[] = JSON.parse(
        storedOrganizationsString
      );
      const updatedOrganizations = organizations.filter(
        (org) => org.id !== organizationId
      );
      localStorage.setItem(
        "organizations",
        JSON.stringify(updatedOrganizations)
      );
      router.push("/organizations");
    }
  };

  const handleDealStageChange = (value: string) => {
    if (organization) {
      const updatedOrg = {
        ...organization,
        dealStage: value as Organization["dealStage"],
      };
      handleEdit(updatedOrg);
      setStatusOpen(false);
    }
  };

  const handleCollectionsChange = useCallback(
    (updatedCollections: string[]) => {
      const storedOrganizations = localStorage.getItem("organizations");
      if (storedOrganizations) {
        const organizations: Organization[] = JSON.parse(storedOrganizations);
        const updatedOrg = organizations.find((o) => o.id === params.id);
        if (updatedOrg) {
          setOrganization(updatedOrg);
        }
      }
    },
    [params.id]
  );

  const handleAddNote = () => {
    if (!newNote.trim() || !organization) return;
    const note = addNote({
      organizationId: organization.id,
      content: newNote.trim(),
      authorName: "You",
    });
    setNotes([note, ...notes]);
    setNewNote("");
  };

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    setNotes(notes.filter((n) => n.id !== noteId));
  };

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-950">
        <div className="container max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 relative flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden">
                <OrganizationImage
                  src={organization.logo || "/placeholder.svg"}
                  alt={`${organization.name} logo`}
                  fill
                  objectFit="cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {organization.name}
                </h1>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {organization.industry}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {organization.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {organization.employees} employees
                  </span>
                  <Link
                    href={organization.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-orange-600 hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </Link>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Left panel with tabs */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="notes">
                  Notes{notes.length > 0 && ` (${notes.length})`}
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                        {organization.description}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Contacts at this organization */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Contacts ({contacts.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {contacts.length > 0 ? (
                        <div className="space-y-3">
                          {contacts.map((person) => (
                            <div
                              key={person.id}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                    {person.name.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {person.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {person.role}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {person.email && (
                                  <a
                                    href={`mailto:${person.email}`}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {person.phone && (
                                  <a
                                    href={`tel:${person.phone}`}
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                                  >
                                    <Phone className="w-3.5 h-3.5" />
                                  </a>
                                )}
                                {person.linkedIn && (
                                  <a
                                    href={person.linkedIn}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600"
                                  >
                                    <Linkedin className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No contacts linked to this organization
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Deals */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Deals ({deals.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {deals.length > 0 ? (
                        <div className="space-y-3">
                          {deals.map((deal) => (
                            <Link
                              key={deal.id}
                              href={`/deals/${deal.id}`}
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                            >
                              <div>
                                <p className="text-sm font-medium">{deal.title}</p>
                                <p className="text-xs text-gray-500">
                                  {deal.stage} &middot; {deal.owner}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-semibold">
                                  {formatDealValue(deal.value)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {deal.probability}% probability
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No deals linked to this organization
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Notes preview */}
                  {notes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">
                          Latest Note
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {notes[0].content}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {notes[0].authorName} &middot;{" "}
                          {getTimeAgo(notes[0].createdAt)}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                <div className="space-y-3">
                  {activities.length > 0 ? (
                    activities.map((activity) => {
                      const Icon = activityIcons[activity.type] || ArrowRight;
                      const colorClass =
                        activityColors[activity.type] ||
                        "text-gray-500 bg-gray-50";

                      return (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg border"
                        >
                          <div
                            className={`p-2 rounded-lg flex-shrink-0 ${colorClass}`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">
                              {activity.title}
                            </p>
                            <p className="text-sm text-gray-500">
                              {activity.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-400">
                                {getTimeAgo(activity.timestamp)}
                              </span>
                              {activity.userName && (
                                <>
                                  <span className="text-xs text-gray-300">
                                    &middot;
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {activity.userName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-12 text-sm text-gray-500">
                      No activity recorded for this organization
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes">
                <div className="space-y-4">
                  {/* Add note form */}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Write a note..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="min-h-[80px] resize-none text-sm"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.metaKey) {
                          handleAddNote();
                        }
                      }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleAddNote}
                      disabled={!newNote.trim()}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Add Note
                    </Button>
                  </div>

                  {/* Notes list */}
                  {notes.length > 0 ? (
                    <div className="space-y-3">
                      {notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-lg border group"
                        >
                          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {note.content}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-gray-400">
                              {note.authorName} &middot;{" "}
                              {getTimeAgo(note.createdAt)}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                              onClick={() => handleDeleteNote(note.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-sm text-gray-500">
                      No notes yet. Add one above.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div className="w-80 space-y-4 flex-shrink-0">
            {/* Deal Stage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Deal Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={statusOpen}
                      className="w-full justify-between text-sm"
                    >
                      {organization.dealStage || "Select stage"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
                    <Command>
                      <CommandInput placeholder="Search stage..." />
                      <CommandEmpty>No stage found.</CommandEmpty>
                      <CommandGroup>
                        {dealStages.map((stage) => (
                          <CommandItem
                            key={stage}
                            onSelect={() => handleDealStageChange(stage)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                organization.dealStage === stage
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {stage}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>

            {/* Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Owner</span>
                  <span className="text-sm font-medium">
                    {organization.owner || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Revenue</span>
                  <span className="text-sm font-medium">
                    {organization.annualRevenue || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Last Contacted</span>
                  <span className="text-sm font-medium">
                    {organization.lastContacted || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Employees</span>
                  <span className="text-sm font-medium">
                    {organization.employees.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Industry</span>
                  <span className="text-sm font-medium">
                    {organization.industry}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Collections */}
            <CollectionManager
              organization={organization}
              onCollectionsChange={handleCollectionsChange}
            />
          </div>
        </div>
      </div>

      {organization && (
        <EditOrganizationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          organization={organization}
        />
      )}
    </>
  );
}
