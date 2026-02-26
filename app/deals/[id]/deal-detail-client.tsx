"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Deal } from "@/types/deal";
import type { Organization, DealStage } from "@/types/organization";
import { getDeal, saveDeal, deleteDeal, formatDealValue } from "@/lib/dealData";
import { getOrganizations } from "@/lib/organizationData";
import { getNotesForOrganization } from "@/lib/notesData";
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
  const [stageOpen, setStageOpen] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editValue, setEditValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    const d = getDeal(params.id);
    if (d) {
      setDeal(d);
      setEditValue(d.value.toString());
      const orgs = getOrganizations();
      const org = orgs.find((o) => o.id === d.organizationId);
      if (org) {
        setOrganization(org);
        setNotes(getNotesForOrganization(org.id));
      }
    } else {
      router.push("/");
    }
  }, [params.id, router]);

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
          </div>
        </div>
      </div>
    </>
  );
}
