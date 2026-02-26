"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import { useRouter } from "next/navigation";
import { formatDealValue } from "@/lib/dealData";
import { getPeople } from "@/lib/personData";
import { useMemo } from "react";

interface DealCardProps {
  deal: Deal;
  organization?: Organization;
}

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

const AVATAR_COLORS = [
  "bg-orange-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-teal-500",
  "bg-indigo-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
];

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

function getAvatarColor(id: string): string {
  const num = parseInt(id, 10) || 0;
  return AVATAR_COLORS[num % AVATAR_COLORS.length];
}

function getRelativeActivityText(
  date: string | undefined,
  type: string | undefined
): string | null {
  if (!date || !type) return null;
  const now = Date.now();
  const activityTime = new Date(date).getTime();
  const diffMs = now - activityTime;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const typeLabel =
    type.charAt(0).toUpperCase() + type.slice(1);

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return `${typeLabel} today`;
    if (absDays === 1) return `${typeLabel} in 1d`;
    return `${typeLabel} in ${absDays}d`;
  }
  if (diffDays === 0) return `${typeLabel} today`;
  if (diffDays === 1) return `${typeLabel} 1d ago`;
  return `${typeLabel} ${diffDays}d ago`;
}

export function DealCard({ deal, organization }: DealCardProps) {
  const router = useRouter();

  const contacts: Person[] = useMemo(() => {
    if (!deal.contactIds || deal.contactIds.length === 0) return [];
    const people = getPeople();
    return deal.contactIds
      .map((cid) => people.find((p) => p.id === cid))
      .filter((p): p is Person => p !== undefined);
  }, [deal.contactIds]);

  const tags = deal.tags || [];
  const visibleTags = tags.slice(0, 2);
  const hiddenTagCount = tags.length - 2;

  const visibleContacts = contacts.slice(0, 3);
  const activityText = getRelativeActivityText(
    deal.lastActivityDate,
    deal.lastActivityType
  );

  const closeDate = deal.expectedCloseDate
    ? new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-800 shadow-sm"
      onClick={() => router.push(`/deals/${deal.id}`)}
    >
      <CardContent className="p-3">
        <div className="flex flex-col gap-1.5">
          {/* Row 1: Title */}
          <h3 className="font-semibold text-sm truncate text-gray-900 dark:text-white">
            {deal.title}
          </h3>

          {/* Row 2: Amount + Close date */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDealValue(deal.value)}
            </span>
            {closeDate && (
              <span className="text-xs text-muted-foreground">
                {closeDate}
              </span>
            )}
          </div>

          {/* Row 3: Next step */}
          {deal.nextStep && (
            <p className="text-xs text-muted-foreground truncate">
              {deal.nextStep}
            </p>
          )}

          {/* Row 4: Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight ${
                    TAG_COLORS[tag] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  {tag}
                </span>
              ))}
              {hiddenTagCount > 0 && (
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{hiddenTagCount}
                </span>
              )}
            </div>
          )}

          {/* Row 5: Contact avatars + last activity */}
          {(visibleContacts.length > 0 || activityText) && (
            <div className="flex items-center justify-between mt-0.5">
              <div className="flex items-center -space-x-1">
                {visibleContacts.map((person) => (
                  <div
                    key={person.id}
                    title={person.name}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold text-white ring-2 ring-white dark:ring-gray-900 ${getAvatarColor(
                      person.id
                    )}`}
                  >
                    {getInitials(person.name)}
                  </div>
                ))}
              </div>
              {activityText && (
                <span className="text-[10px] text-muted-foreground">
                  {activityText}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
