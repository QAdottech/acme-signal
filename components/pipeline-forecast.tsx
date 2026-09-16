"use client";

import { useMemo } from "react";
import type { Deal } from "@/types/deal";
import { formatCompactValue, formatCurrency, STAGE_PROBABILITIES } from "@/lib/dealData";
import { displayStageName, OPEN_STAGES } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

interface PipelineForecastProps {
  deals: Deal[];
}

export function PipelineForecast({ deals }: PipelineForecastProps) {
  const months = useMemo(() => {
    const map = new Map<
      string,
      { key: string; label: string; deals: Deal[]; total: number; weighted: number }
    >();

    deals.forEach((deal) => {
      const date = new Date(deal.expectedCloseDate);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const label = date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      });
      const existing = map.get(key) || {
        key,
        label,
        deals: [],
        total: 0,
        weighted: 0,
      };
      existing.deals.push(deal);
      existing.total += deal.value;
      existing.weighted += deal.value * ((deal.probability ?? STAGE_PROBABILITIES[deal.stage] ?? 0) / 100);
      map.set(key, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key));
  }, [deals]);

  const maxTotal = Math.max(...months.map((m) => m.total), 1);

  if (months.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-neutral-400">
        No forecasted close dates in this view.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {months.map((month) => (
        <div
          key={month.key}
          className="rounded-xl border border-neutral-200 bg-white p-4"
        >
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                {month.label}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                {month.deals.length} deals
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold tabular-nums">
                {formatCurrency(month.total)}
              </div>
              <div className="text-xs text-blue-600 tabular-nums">
                {formatCompactValue(month.weighted)} weighted
              </div>
            </div>
          </div>
          <div className="h-2 bg-neutral-100 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${(month.total / maxTotal) * 100}%` }}
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {OPEN_STAGES.map((stage) => {
              const count = month.deals.filter((d) => d.stage === stage).length;
              if (!count) return null;
              return (
                <span
                  key={stage}
                  className={cn(
                    "text-[11px] px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600"
                  )}
                >
                  {displayStageName(stage)} {count}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
