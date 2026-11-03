import type { DealStage } from "@/types/organization";

type StageStyle = { dot: string; badge: string };

/** Soft tint + coloured dot, one hue per stage. */
export const STAGE_STYLES: Record<DealStage, StageStyle> = {
  New: {
    dot: "bg-gray-400",
    badge: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  Lead: {
    dot: "bg-sky-500",
    badge: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  },
  Qualified: {
    dot: "bg-indigo-500",
    badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  },
  Proposal: {
    dot: "bg-violet-500",
    badge: "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300",
  },
  Negotiation: {
    dot: "bg-amber-500",
    badge: "bg-amber-50 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  },
  Customer: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  Churned: {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
  "Closed Lost": {
    dot: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  },
};

export function getStageStyle(stage: string): StageStyle {
  return STAGE_STYLES[stage as DealStage] ?? STAGE_STYLES.New;
}
