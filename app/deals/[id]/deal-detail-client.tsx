"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Deal } from "@/types/deal";
import type { Organization, DealStage } from "@/types/organization";
import type { Person } from "@/types/person";
import { getDeal, saveDeal, deleteDeal, formatDealValue } from "@/lib/dealData";
import { getOrganizations } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { getNotesForOrganization } from "@/lib/notesData";
import { getTasksForDeal } from "@/lib/taskData";
import type { Task } from "@/types/task";
import type { Note } from "@/lib/notesData";
import { OrganizationImage } from "@/components/organization-image";
import {
  Building2,
  Calendar,
  DollarSign,
  User,
  TrendingUp,
  ArrowLeft,
  Trash2,
  ChevronsUpDown,
  Check,
  X,
  Users,
  ArrowRight,
  Tag,
  CheckSquare,
} from "lucide-react";
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

const dealStages: DealStage[] = [
  "New",
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Customer",
  "Churned",
  "Closed Lost",
];

const stageColors: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  Lead: "bg-blue-100 text-blue-700",
  Qualified: "bg-orange-100 text-orange-700",
  Proposal: "bg-purple-100 text-purple-700",
  Negotiation: "bg-amber-100 text-amber-700",
  Customer: "bg-green-100 text-green-700",
  Churned: "bg-red-100 text-red-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

const TAG_COLORS: Record<string, string> = {
  "Pre POC": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  POC: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "POC Complete": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Enterprise: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Startup: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  Expansion: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  Renewal: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
  "At Risk": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  "Champion Identified": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  "Technical Eval": "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
};

const AVAILABLE_TAGS = [
  "Pre POC",
  "POC",
  "POC Complete",
  "Enterprise",
  "Startup",
  "Expansion",
  "Renewal",
  "At Risk",
  "Champion Identified",
  "Technical Eval",
];

function getTimeAgo(timestamp: string) {
  const now = new Date();
  const time = new Date(timestamp);
  const diffMs = now.getTime() - time.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function DealDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [organizations, setOrganizationsList] = useState<Organization[]>([]);
  const [stageOpen, setStageOpen] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [isEditingNextStep, setIsEditingNextStep] = useState(false);
  const [editNextStep, setEditNextStep] = useState("");
  const [tagsOpen, setTagsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const d = getDeal(params.id);
    if (d) {
      setDeal(d);
      setEditValue(d.value.toString());
      setEditNextStep(d.nextStep || "");
      const orgs = getOrganizations();
      setOrganizationsList(orgs);
      const org = orgs.find((o) => o.id === d.organizationId);
      if (org) {
        setOrganization(org);
        setNotes(getNotesForOrganization(org.id));
      }
      setTasks(getTasksForDeal(d.id));
      setPeople(getPeople());
    } else {
      router.push("/");
    }
  }, [params.id, router]);

  const linkedContacts = useMemo(() => {
    if (!deal?.contactIds || deal.contactIds.length === 0) return [];
    return deal.contactIds
      .map((cid) => people.find((p) => p.id === cid))
      .filter((p): p is Person => p !== undefined);
  }, [deal?.contactIds, people]);

  const handleStageChange = (newStage: string) => {
    if (deal) {
      const updated = { ...deal, stage: newStage as DealStage };
      saveDeal(updated);
      setDeal(updated);
      setStageOpen(false);
    }
  };

  const handleValueSave = () => {
    if (deal) {
      const updated = { ...deal, value: Number(editValue) };
      saveDeal(updated);
      setDeal(updated);
      setIsEditingValue(false);
    }
  };

  const handleNextStepSave = () => {
    if (deal) {
      const updated = { ...deal, nextStep: editNextStep || undefined };
      saveDeal(updated);
      setDeal(updated);
      setIsEditingNextStep(false);
    }
  };

  const handleAddTag = (tag: string) => {
    if (deal) {
      const currentTags = deal.tags || [];
      if (!currentTags.includes(tag)) {
        const updated = { ...deal, tags: [...currentTags, tag] };
        saveDeal(updated);
        setDeal(updated);
      }
      setTagsOpen(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    if (deal) {
      const currentTags = deal.tags || [];
      const updated = { ...deal, tags: currentTags.filter((t) => t !== tag) };
      saveDeal(updated);
      setDeal(updated);
    }
  };

  const handleDelete = () => {
    if (deal) {
      deleteDeal(deal.id);
      router.push("/");
    }
  };

  if (!deal || !organization) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-950">
        <div className="container max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <button
              onClick={() => router.push("/")}
              className="hover:text-gray-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Pipeline
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white">{deal.title}</span>
          </div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {deal.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <Link
                  href={`/organizations/${organization.id}`}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                    <OrganizationImage
                      src={organization.logo}
                      alt={organization.name}
                      width={20}
                      height={20}
                    />
                  </div>
                  {organization.name}
                </Link>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium",
                    stageColors[deal.stage] || "bg-gray-100 text-gray-700"
                  )}
                >
                  {deal.stage}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex gap-8">
          {/* Left panel */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Deal value card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deal Value</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingValue ? (
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-400">$</span>
                    <Input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="text-2xl font-bold w-48"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleValueSave();
                        if (e.key === "Escape") setIsEditingValue(false);
                      }}
                    />
                    <Button size="sm" onClick={handleValueSave}>
                      Save
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingValue(true)}
                    className="text-3xl font-bold text-gray-900 dark:text-white hover:text-orange-600 transition-colors"
                  >
                    {formatDealValue(deal.value, deal.currency)}
                  </button>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  Weighted: {formatDealValue(deal.value * (deal.probability / 100))} ({deal.probability}% probability)
                </p>
              </CardContent>
            </Card>

            {/* Company info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Company</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/organizations/${organization.id}`}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <OrganizationImage
                      src={organization.logo}
                      alt={organization.name}
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">
                      {organization.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {organization.industry} &middot; {organization.location} &middot; {organization.employees} employees
                    </p>
                  </div>
                </Link>
              </CardContent>
            </Card>

            {/* Recent notes from the company */}
            {notes.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">
                    Recent Notes ({notes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {notes.slice(0, 3).map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-lg border"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {note.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {note.authorName} &middot; {getTimeAgo(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Tasks */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  Tasks ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tasks.length > 0 ? (
                  <div className="space-y-2">
                    {tasks.map((task) => {
                      const isDone = task.status === "done";
                      const isOverdue =
                        !isDone &&
                        task.dueDate &&
                        task.dueDate < new Date().toISOString().split("T")[0];
                      return (
                        <Link
                          key={task.id}
                          href="/tasks"
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                            isDone && "opacity-60"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center",
                              isDone
                                ? "bg-green-500 border-green-500"
                                : "border-gray-300 dark:border-gray-600"
                            )}
                          >
                            {isDone && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm font-medium truncate",
                                isDone && "line-through text-muted-foreground"
                              )}
                            >
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              {task.dueDate && (
                                <span
                                  className={cn(
                                    "text-xs",
                                    isOverdue
                                      ? "text-red-600 dark:text-red-400 font-medium"
                                      : "text-gray-500"
                                  )}
                                >
                                  {new Date(
                                    task.dueDate + "T00:00:00"
                                  ).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                  })}
                                  {isOverdue && " (overdue)"}
                                </span>
                              )}
                              {task.priority === "high" && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                  High
                                </span>
                              )}
                              {task.priority === "urgent" && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No tasks linked to this deal
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="w-80 space-y-4 flex-shrink-0">
            {/* Stage */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Stage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={stageOpen} onOpenChange={setStageOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between text-sm"
                    >
                      {deal.stage}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
                    <Command>
                      <CommandInput placeholder="Search stage..." />
                      <CommandEmpty>No stage found.</CommandEmpty>
                      <CommandGroup>
                        {dealStages.map((s) => (
                          <CommandItem
                            key={s}
                            onSelect={() => handleStageChange(s)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                deal.stage === s
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {s}
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
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    Owner
                  </span>
                  <span className="text-sm font-medium">{deal.owner}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    Value
                  </span>
                  <span className="text-sm font-medium">
                    {formatDealValue(deal.value)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Probability
                  </span>
                  <span className="text-sm font-medium">{deal.probability}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Expected Close
                  </span>
                  <span className="text-sm font-medium">
                    {new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Company
                  </span>
                  <Link
                    href={`/organizations/${organization.id}`}
                    className="text-sm font-medium text-orange-600 hover:underline"
                  >
                    {organization.name}
                  </Link>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Created
                  </span>
                  <span className="text-sm font-medium">
                    {getTimeAgo(deal.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Next Step */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                  Next Step
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditingNextStep ? (
                  <div className="space-y-2">
                    <Input
                      value={editNextStep}
                      onChange={(e) => setEditNextStep(e.target.value)}
                      className="text-sm focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                      placeholder="What's the next action?"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNextStepSave();
                        if (e.key === "Escape") {
                          setEditNextStep(deal.nextStep || "");
                          setIsEditingNextStep(false);
                        }
                      }}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleNextStepSave}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditNextStep(deal.nextStep || "");
                          setIsEditingNextStep(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingNextStep(true)}
                    className="text-sm text-left w-full hover:text-orange-600 transition-colors"
                  >
                    {deal.nextStep || (
                      <span className="text-gray-400 italic">
                        Click to add next step...
                      </span>
                    )}
                  </button>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(deal.tags && deal.tags.length > 0) && (
                    <div className="flex flex-wrap gap-1.5">
                      {deal.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            TAG_COLORS[tag] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:opacity-70"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-between text-xs"
                      >
                        Add tag...
                        <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[220px] p-0">
                      <Command>
                        <CommandInput placeholder="Search tags..." />
                        <CommandEmpty>No tag found.</CommandEmpty>
                        <CommandGroup className="max-h-[200px] overflow-auto">
                          {AVAILABLE_TAGS.filter(
                            (t) => !(deal.tags || []).includes(t)
                          ).map((tag) => (
                            <CommandItem
                              key={tag}
                              onSelect={() => handleAddTag(tag)}
                            >
                              {tag}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>

            {/* Linked Contacts */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Linked Contacts ({linkedContacts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {linkedContacts.length > 0 ? (
                  <div className="space-y-2">
                    {linkedContacts.map((person) => {
                      const personOrg = organizations.find(
                        (o) => o.name === person.organization
                      );
                      return (
                        <div
                          key={person.id}
                          className="flex items-center gap-3 p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-semibold text-white flex-shrink-0">
                            {person.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {person.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {person.role}
                              {personOrg && (
                                <>
                                  {" "}
                                  at{" "}
                                  <Link
                                    href={`/organizations/${personOrg.id}`}
                                    className="text-orange-600 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {personOrg.name}
                                  </Link>
                                </>
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No linked contacts
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
