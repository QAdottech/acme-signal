"use client";

import { useState, useEffect, useCallback } from "react";
import type { DealStage } from "@/types/organization";
import { DEFAULT_VISIBLE_STAGES } from "@/lib/pipelineConfig";

export type PipelineView = "board" | "list";
export type PipelineSort =
  | "default"
  | "value-desc"
  | "close-date-asc"
  | "activity-desc"
  | "created-desc";
export type PipelineDensity = "comfortable" | "compact";

export interface PipelineViewPrefs {
  view: PipelineView;
  visibleStages: DealStage[];
  sortBy: PipelineSort;
  density: PipelineDensity;
}

const STORAGE_KEY = "pipeline-view-prefs";

export const DEFAULT_PREFS: PipelineViewPrefs = {
  view: "board",
  visibleStages: DEFAULT_VISIBLE_STAGES,
  sortBy: "default",
  density: "comfortable",
};

export function usePipelineViewPrefs(): [
  PipelineViewPrefs,
  (patch: Partial<PipelineViewPrefs>) => void,
  () => void,
] {
  const [prefs, setPrefsState] = useState<PipelineViewPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<PipelineViewPrefs>;
        setPrefsState({ ...DEFAULT_PREFS, ...parsed });
      }
    } catch {
      // ignore bad data
    }
  }, []);

  const setPrefs = useCallback((patch: Partial<PipelineViewPrefs>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota errors
      }
      return next;
    });
  }, []);

  const resetPrefs = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setPrefsState(DEFAULT_PREFS);
  }, []);

  return [prefs, setPrefs, resetPrefs];
}
