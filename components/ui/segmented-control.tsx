"use client";

import { cn } from "@/lib/utils";

export interface SegmentedOption<T extends string> {
  value: T;
  label: React.ReactNode;
}

/**
 * Compact single-choice filter (e.g. All / Active / Inactive). Each option is
 * a real button with aria-pressed, so it stays accessible and testable.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  "aria-label": ariaLabel,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex h-8 items-center gap-0.5 rounded-md border border-input bg-muted/60 p-0.5",
        className
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "inline-flex h-full items-center rounded-[5px] px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
