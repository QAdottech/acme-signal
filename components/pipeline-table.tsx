"use client";

import Link from "next/link";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import { formatCurrency } from "@/lib/dealData";
import { displayStageName, getAvatarStyle, getInitials } from "@/lib/pipeline";

interface PipelineTableProps {
  deals: Deal[];
  organizations: Record<string, Organization>;
}

export function PipelineTable({ deals, organizations }: PipelineTableProps) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-neutral-400">
        No deals match these filters.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 text-left text-xs text-neutral-400">
            <th className="font-medium px-4 py-3">Deal</th>
            <th className="font-medium px-4 py-3">Company</th>
            <th className="font-medium px-4 py-3">Value</th>
            <th className="font-medium px-4 py-3">Stage</th>
            <th className="font-medium px-4 py-3">Owner</th>
            <th className="font-medium px-4 py-3">Close</th>
            <th className="font-medium px-4 py-3 text-right">Prob.</th>
          </tr>
        </thead>
        <tbody>
          {deals.map((deal) => {
            const org = organizations[deal.organizationId];
            return (
              <tr
                key={deal.id}
                className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50/80"
              >
                <td className="px-4 py-3 font-medium text-neutral-900">
                  <Link href={`/deals/${deal.id}`} className="hover:underline">
                    {deal.title}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/organizations/${deal.organizationId}`}
                    className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900"
                  >
                    <span
                      className="w-5 h-5 rounded-[5px] text-[9px] font-semibold flex items-center justify-center shrink-0"
                      style={getAvatarStyle(org?.name || deal.organizationId)}
                    >
                      {getInitials(org?.name || "?")}
                    </span>
                    <span className="truncate">{org?.name || "Unknown"}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 tabular-nums font-medium">
                  {formatCurrency(deal.value)}
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {displayStageName(deal.stage)}
                </td>
                <td className="px-4 py-3 text-neutral-600">{deal.owner}</td>
                <td className="px-4 py-3 text-neutral-500">
                  {new Date(deal.expectedCloseDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-neutral-500">
                  {deal.probability}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
