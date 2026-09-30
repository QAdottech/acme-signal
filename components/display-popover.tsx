"use client";

import React from "react";
import { LayoutGrid, List } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PIPELINE_STAGES } from "@/lib/pipelineConfig";
import type {
  PipelineViewPrefs,
  PipelineSort,
} from "@/lib/usePipelineViewPrefs";
import type { DealStage } from "@/types/organization";

interface DisplayPopoverProps {
  children: React.ReactNode;
  prefs: PipelineViewPrefs;
  setPrefs: (patch: Partial<PipelineViewPrefs>) => void;
  resetPrefs: () => void;
}

const SORT_OPTIONS: { value: PipelineSort; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "value-desc", label: "Value (high to low)" },
  { value: "close-date-asc", label: "Close date (soonest)" },
  { value: "activity-desc", label: "Last activity" },
  { value: "created-desc", label: "Created (newest)" },
];

export function DisplayPopover({
  children,
  prefs,
  setPrefs,
  resetPrefs,
}: DisplayPopoverProps) {
  const allVisible = prefs.visibleStages.length === PIPELINE_STAGES.length;

  const toggleStage = (name: DealStage) => {
    const next = prefs.visibleStages.includes(name)
      ? prefs.visibleStages.filter((s) => s !== name)
      : [...prefs.visibleStages, name];
    setPrefs({ visibleStages: next });
  };

  const toggleAll = () => {
    if (allVisible) {
      setPrefs({ visibleStages: [] });
    } else {
      setPrefs({ visibleStages: PIPELINE_STAGES.map((s) => s.name) });
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-white rounded-md shadow-md border border-gray-200">
        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-1">Display</h4>
          <p className="text-xs text-gray-500">
            Customize how the pipeline is displayed.
          </p>
        </div>

        <div className="space-y-4">
          {/* View toggle */}
          <div>
            <h5 className="text-xs font-semibold mb-2">View</h5>
            <div className="flex rounded-md bg-gray-100 p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setPrefs({ view: "board" })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-colors",
                  prefs.view === "board"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Board
              </button>
              <button
                type="button"
                onClick={() => setPrefs({ view: "list" })}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-medium transition-colors",
                  prefs.view === "list"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
            </div>
          </div>

          {/* Stages */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-semibold">Stages</h5>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[10px] text-orange-500 hover:text-orange-600 font-medium"
              >
                {allVisible ? "Hide all" : "Show all"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
              {PIPELINE_STAGES.map(({ name }) => (
                <div key={name} className="flex items-center space-x-2">
                  <Checkbox
                    id={`stage-${name}`}
                    checked={prefs.visibleStages.includes(name)}
                    onCheckedChange={() => toggleStage(name)}
                    className={cn(
                      "peer h-3 w-3 shrink-0 rounded-sm border border-gray-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500",
                      "flex items-center justify-center [&>span]:h-2 [&>span]:w-2"
                    )}
                  />
                  <Label
                    htmlFor={`stage-${name}`}
                    className="text-xs font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {name}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Sort by */}
          <div>
            <h5 className="text-xs font-semibold mb-2">Sort by</h5>
            <Select
              value={prefs.sortBy}
              onValueChange={(val) =>
                setPrefs({ sortBy: val as PipelineSort })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-xs">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Card density — board only */}
          <div className={cn(prefs.view === "list" && "opacity-40 pointer-events-none")}>
            <h5 className="text-xs font-semibold mb-2">
              Card density
              {prefs.view === "list" && (
                <span className="ml-1 font-normal text-gray-400">(board only)</span>
              )}
            </h5>
            <div className="flex rounded-md bg-gray-100 p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setPrefs({ density: "comfortable" })}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors",
                  prefs.density === "comfortable"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Comfortable
              </button>
              <button
                type="button"
                onClick={() => setPrefs({ density: "compact" })}
                className={cn(
                  "flex-1 py-1.5 px-2 rounded text-xs font-medium transition-colors",
                  prefs.density === "compact"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                Compact
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetPrefs}
            className="w-full text-xs text-gray-400 hover:text-gray-600 h-7"
          >
            Reset to defaults
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
