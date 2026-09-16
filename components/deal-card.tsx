"use client";

import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/dealData";
import {
  dealTag,
  getAvatarColor,
  getDaysSinceActivity,
  getInitials,
  isDealStalled,
  TAG_COLORS,
} from "@/lib/pipeline";
import { AlertTriangle, Check, Circle, Square } from "lucide-react";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: Deal;
  organization?: Organization;
}

function NextStepIcon({
  stalled,
  nextStep,
  signatureStatus,
}: {
  stalled: boolean;
  nextStep?: string;
  signatureStatus?: string;
}) {
  if (stalled) {
    return <AlertTriangle className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />;
  }
  const text = (nextStep || "").toLowerCase();
  if (
    signatureStatus === "sent" ||
    signatureStatus === "signed" ||
    /signatur|redline|contract/.test(text)
  ) {
    return (
      <span className="w-3.5 h-3.5 shrink-0 mt-0.5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
        <Check className="w-2.5 h-2.5" strokeWidth={3} />
      </span>
    );
  }
  if (/review|finalize|sow|terms|walkthrough/.test(text)) {
    return <Square className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />;
  }
  return <Circle className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />;
}

export function DealCard({ deal, organization }: DealCardProps) {
  const router = useRouter();
  const stalled = isDealStalled(deal);
  const daysSince = getDaysSinceActivity(deal);
  const tag = dealTag(deal);
  const orgName = organization?.name || "Unknown";
  const closeDate = deal.expectedCloseDate
    ? new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : null;

  const nextStepText = stalled
    ? `No activity in ${daysSince} days`
    : deal.nextStep || "No next step";

  const nextStepClass = stalled
    ? "text-orange-600"
    : /signatur|redline|contract/i.test(deal.nextStep || "") ||
      deal.signatureStatus === "sent" ||
      deal.signatureStatus === "signed"
    ? "text-emerald-700"
    : "text-neutral-500";

  return (
    <div
      className={cn(
        "cursor-pointer rounded-xl border bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-md",
        stalled ? "border-orange-400" : "border-neutral-200/80"
      )}
      onClick={() => router.push(`/deals/${deal.id}`)}
    >
      <div className="flex items-center gap-2 mb-2 min-w-0">
        <div
          className={cn(
            "w-5 h-5 rounded-[5px] text-[9px] font-semibold flex items-center justify-center shrink-0",
            getAvatarColor(orgName)
          )}
        >
          {getInitials(orgName)}
        </div>
        <span className="text-xs text-neutral-500 truncate">{orgName}</span>
      </div>

      <h3 className="text-[13px] font-semibold text-neutral-900 leading-snug mb-2 line-clamp-2">
        {deal.title}
      </h3>

      <div className="flex items-baseline justify-between mb-1.5">
        <span className="text-[15px] font-semibold tabular-nums text-neutral-900">
          {formatCurrency(deal.value)}
        </span>
        <span className="text-xs text-neutral-400 tabular-nums">
          {deal.probability}%
        </span>
      </div>

      <div className="h-[3px] bg-neutral-100 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-neutral-800 rounded-full"
          style={{ width: `${Math.min(deal.probability, 100)}%` }}
        />
      </div>

      <div className="flex items-start gap-1.5 mb-3 min-w-0">
        <NextStepIcon
          stalled={stalled}
          nextStep={deal.nextStep}
          signatureStatus={deal.signatureStatus}
        />
        <span className={cn("text-xs truncate", nextStepClass)}>
          {nextStepText}
        </span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className={cn(
              "w-5 h-5 rounded-md text-[9px] font-semibold flex items-center justify-center shrink-0",
              getAvatarColor(deal.owner)
            )}
          >
            {getInitials(deal.owner)}
          </div>
          {closeDate && (
            <span className="text-xs text-neutral-400 truncate">{closeDate}</span>
          )}
        </div>
        {tag && (
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded-md text-[11px] font-medium leading-tight shrink-0",
              TAG_COLORS[tag] || "bg-neutral-100 text-neutral-600"
            )}
          >
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}
