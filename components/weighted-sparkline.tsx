"use client";

import { cn } from "@/lib/utils";

interface WeightedSparklineProps {
  values: number[];
  changePct: number;
}

export function WeightedSparkline({ values, changePct }: WeightedSparklineProps) {
  const width = 128;
  const height = 36;
  const padding = 2;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const points = values.map((value, index) => {
    const x =
      values.length === 1
        ? width / 2
        : padding + (index / (values.length - 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const last = points[points.length - 1]?.split(",") ?? ["0", "0"];
  const positive = changePct >= 0;

  return (
    <div className="hidden md:flex flex-col items-end mr-1">
      <div className="flex items-center gap-2 text-[11px] text-neutral-400 mb-0.5">
        <span>13-week weighted</span>
        <span className={cn(positive ? "text-blue-600" : "text-red-500")}>
          {positive ? "+" : ""}
          {changePct.toFixed(1)}%
        </span>
      </div>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="#2563eb"
          strokeWidth="1.75"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <circle cx={last[0]} cy={last[1]} r="2.4" fill="#2563eb" />
      </svg>
    </div>
  );
}
