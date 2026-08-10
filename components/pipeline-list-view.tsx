"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDealValue, STAGE_PROBABILITIES } from "@/lib/dealData";
import { PIPELINE_STAGES, STAGE_COLORS } from "@/lib/pipelineConfig";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { DealStage } from "@/types/organization";
import { OrganizationImage } from "@/components/organization-image";

interface PipelineListViewProps {
  deals: Deal[];
  organizations: Organization[];
  visibleStages: DealStage[];
}

function StageSection({
  stageName,
  deals,
  organizations,
  probability,
}: {
  stageName: DealStage;
  deals: Deal[];
  organizations: Organization[];
  probability: number;
}) {
  const [open, setOpen] = useState(true);
  const orgMap = Object.fromEntries(organizations.map((o) => [o.id, o]));

  const total = deals.reduce((sum, d) => sum + d.value, 0);
  const weighted = deals.reduce(
    (sum, d) => sum + d.value * (probability / 100),
    0
  );

  const stageColorClass = STAGE_COLORS[stageName] ?? "bg-gray-100 text-gray-700";

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-medium",
            stageColorClass
          )}
        >
          {stageName}
        </span>
        <span className="text-xs text-muted-foreground bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {deals.length}
        </span>
        <div className="ml-auto flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            <span className="text-gray-400">Total </span>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {formatDealValue(total)}
            </span>
          </span>
          <span>
            <span className="text-gray-400">Weighted </span>
            <span className="font-medium text-gray-700 dark:text-gray-200">
              {formatDealValue(weighted)}
            </span>
          </span>
        </div>
      </button>

      {/* Table */}
      {open && (
        <Table>
          <TableHeader>
            <TableRow className="bg-white dark:bg-gray-900">
              <TableHead className="text-xs">Deal</TableHead>
              <TableHead className="text-xs">Company</TableHead>
              <TableHead className="text-xs">Value</TableHead>
              <TableHead className="text-xs">Owner</TableHead>
              <TableHead className="text-xs">Close Date</TableHead>
              <TableHead className="text-xs">Prob.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-xs text-muted-foreground py-4"
                >
                  No deals in this stage
                </TableCell>
              </TableRow>
            ) : (
              deals.map((deal) => {
                const org = orgMap[deal.organizationId];
                return (
                  <TableRow
                    key={deal.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <TableCell className="font-medium text-sm">
                      <Link href={`/deals/${deal.id}`} className="block hover:text-orange-600 transition-colors">
                        {deal.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {org ? (
                        <Link
                          href={`/organizations/${org.id}`}
                          className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                        >
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <OrganizationImage
                              src={org.logo}
                              alt={org.name}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                          </div>
                          <span className="text-sm truncate max-w-[140px]">
                            {org.name}
                          </span>
                        </Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      <Link href={`/deals/${deal.id}`} className="block">
                        {formatDealValue(deal.value)}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link href={`/deals/${deal.id}`} className="block">
                        {deal.owner}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link href={`/deals/${deal.id}`} className="block">
                        {deal.expectedCloseDate
                          ? new Date(deal.expectedCloseDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )
                          : "—"}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm">
                      <Link href={`/deals/${deal.id}`} className="block">
                        {deal.probability}%
                      </Link>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

export function PipelineListView({
  deals,
  organizations,
  visibleStages,
}: PipelineListViewProps) {
  return (
    <div className="space-y-3">
      {PIPELINE_STAGES.filter((s) => visibleStages.includes(s.name)).map(
        (stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.name);
          const probability = STAGE_PROBABILITIES[stage.name] ?? 0;
          return (
            <StageSection
              key={stage.id}
              stageName={stage.name}
              deals={stageDeals}
              organizations={organizations}
              probability={probability}
            />
          );
        }
      )}
    </div>
  );
}
