"use client";

import { cn } from "@/lib/utils";
import {
  DEAL_HEALTH_BADGE_CLASSES,
  DEAL_HEALTH_LABELS,
} from "@/lib/dealData";
import type { DealHealth } from "@/types/deal";

interface DealHealthBadgeProps {
  health: DealHealth;
  className?: string;
}

export function DealHealthBadge({ health, className }: DealHealthBadgeProps) {
  return (
    <span
      title={DEAL_HEALTH_LABELS[health]}
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-tight",
        DEAL_HEALTH_BADGE_CLASSES[health],
        className
      )}
    >
      {DEAL_HEALTH_LABELS[health]}
    </span>
  );
}
