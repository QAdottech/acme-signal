"use client";

import { Button } from "@/components/ui/button";
import { FilterPopover } from "@/components/filter-popover";
import { cn } from "@/lib/utils";
import { formatCompactValue } from "@/lib/dealData";
import { ListFilter, Plus, X } from "lucide-react";
import { WeightedSparkline } from "@/components/weighted-sparkline";
import { displayStageName, OPEN_STAGES } from "@/lib/pipeline";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import type { DealStage } from "@/types/organization";

type PipelineTab = "board" | "table" | "forecast";

interface PipelineHeaderProps {
  openModal: () => void;
  filters: {
    location: string[];
    dealStage: string[];
    industry: string[];
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      location: string[];
      dealStage: string[];
      industry: string[];
    }>
  >;
  owners: string[];
  selectedOwners: string[];
  setSelectedOwners: (owners: string[]) => void;
  ownerMe: boolean;
  setOwnerMe: (value: boolean) => void;
  currentUserName?: string;
  totalValue: number;
  weightedValue: number;
  dealCount: number;
  coverage: number;
  sparkline: number[];
  sparklineChange: number;
  tab: PipelineTab;
  onTabChange: (tab: PipelineTab) => void;
}

export function PipelineHeader({
  openModal,
  filters,
  setFilters,
  owners,
  selectedOwners,
  setSelectedOwners,
  ownerMe,
  setOwnerMe,
  currentUserName,
  totalValue,
  weightedValue,
  dealCount,
  coverage,
  sparkline,
  sparklineChange,
  tab,
  onTabChange,
}: PipelineHeaderProps) {
  const extraFilters = filters.location.length + filters.industry.length;
  const stageFilters = filters.dealStage;
  const ownerCount = selectedOwners.length + (ownerMe ? 1 : 0);
  const hasChips = stageFilters.length > 0 || ownerCount > 0 || extraFilters > 0;

  const clearFilters = () => {
    setFilters({ location: [], dealStage: [], industry: [] });
    setSelectedOwners([]);
    setOwnerMe(false);
  };

  const toggleStage = (stage: DealStage) => {
    setFilters((prev) => {
      const exists = prev.dealStage.includes(stage);
      return {
        ...prev,
        dealStage: exists
          ? prev.dealStage.filter((s) => s !== stage)
          : [...prev.dealStage, stage],
      };
    });
  };

  const toggleOwner = (owner: string) => {
    setSelectedOwners(
      selectedOwners.includes(owner)
        ? selectedOwners.filter((o) => o !== owner)
        : [...selectedOwners, owner]
    );
  };

  const stageLabel =
    stageFilters.length === 0
      ? "Stage"
      : `Stage: ${displayStageName(stageFilters[0])}${
          stageFilters.length > 1 ? ` +${stageFilters.length - 1}` : ""
        }`;

  const ownerLabel =
    ownerCount === 0
      ? "Owner"
      : ownerMe && selectedOwners.length === 0
      ? "Owner: me"
      : `Owner: ${ownerMe ? "me" : selectedOwners[0]}${
          ownerCount > 1 ? ` +${ownerCount - 1}` : ""
        }`;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <h1 className="text-[22px] font-semibold tracking-tight text-neutral-900">
            Sales pipeline
          </h1>
          <div className="flex items-center gap-3 text-[13px] mt-1.5 text-neutral-500 flex-wrap">
            <span>{dealCount} open deals</span>
            <span className="text-neutral-300">|</span>
            <span>{formatCompactValue(totalValue)} value</span>
            <span className="text-neutral-300">|</span>
            <span className="text-blue-600 font-medium">
              {formatCompactValue(weightedValue)} weighted
            </span>
            <span className="text-neutral-300">|</span>
            <span>{coverage.toFixed(1)}x coverage</span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <WeightedSparkline values={sparkline} changePct={sparklineChange} />
          <FilterPopover filters={filters} setFilters={setFilters}>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-lg border-neutral-200 bg-white hover:bg-neutral-50",
                extraFilters > 0 && "border-neutral-400"
              )}
            >
              <ListFilter className="w-4 h-4 text-neutral-600" />
            </Button>
          </FilterPopover>
          <Button
            onClick={openModal}
            size="sm"
            className="h-9 gap-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white px-3.5"
          >
            <Plus className="w-4 h-4" />
            New deal
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {(
            [
              ["board", "Board"],
              ["table", "Table"],
              ["forecast", "Forecast"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={cn(
                "text-[13px] pb-0.5 border-b-2 transition-colors",
                tab === id
                  ? "text-neutral-900 font-semibold border-transparent"
                  : "text-neutral-400 font-medium border-transparent hover:text-neutral-700"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "h-7 px-2.5 rounded-md text-xs font-medium border transition-colors",
                  stageFilters.length > 0
                    ? "bg-neutral-100 border-neutral-200 text-neutral-800"
                    : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                )}
              >
                {stageLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-2">
              <div className="space-y-1">
                {OPEN_STAGES.map((stage) => (
                  <label
                    key={stage}
                    className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-neutral-50 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={stageFilters.includes(stage)}
                      onCheckedChange={() => toggleStage(stage)}
                    />
                    {displayStageName(stage)}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  "h-7 px-2.5 rounded-md text-xs font-medium border transition-colors",
                  ownerCount > 0
                    ? "bg-neutral-100 border-neutral-200 text-neutral-800"
                    : "bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50"
                )}
              >
                {ownerLabel}
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-52 p-2">
              <div className="space-y-1">
                <label className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-neutral-50 text-sm cursor-pointer">
                  <Checkbox
                    checked={ownerMe}
                    onCheckedChange={(checked) => setOwnerMe(Boolean(checked))}
                  />
                  Me{currentUserName ? ` (${currentUserName})` : ""}
                </label>
                {owners.map((owner) => (
                  <label
                    key={owner}
                    className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-neutral-50 text-sm cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedOwners.includes(owner)}
                      onCheckedChange={() => toggleOwner(owner)}
                    />
                    {owner}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {hasChips && (
            <button
              onClick={clearFilters}
              className="h-7 px-2 rounded-md text-xs font-medium text-neutral-400 hover:text-neutral-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
