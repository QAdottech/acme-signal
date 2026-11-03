"use client";

import { Download, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const barButton =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-colors hover:bg-background/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/40 [&_svg]:h-3.5 [&_svg]:w-3.5";

/**
 * Floating bar shown while rows are selected: a bulk "set field" menu,
 * export, delete, and clear.
 */
export function SelectionBar<V extends string>({
  count,
  nouns,
  setField,
  onExport,
  onDelete,
  onClear,
}: {
  count: number;
  /** Singular and plural record names, e.g. ["company", "companies"]. */
  nouns: [string, string];
  setField?: {
    label: string;
    options: readonly V[];
    renderOption?: (value: V) => React.ReactNode;
    onSelect: (value: V) => void;
  };
  onExport: () => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  if (count === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      className="fixed bottom-12 left-[calc(50%+7.5rem)] z-40 -translate-x-1/2 animate-in fade-in-0 slide-in-from-bottom-2"
    >
      <div className="flex items-center gap-1 rounded-lg bg-foreground py-1 pl-3 pr-1 text-background shadow-xl">
        <span className="pr-2 text-[13px] font-medium tabular-nums">
          {count} {count === 1 ? nouns[0] : nouns[1]} selected
        </span>
        <span className="h-4 w-px bg-background/20" />
        {setField && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className={barButton}>
                {setField.label}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top" className="min-w-[180px]">
              {setField.options.map((option) => (
                <DropdownMenuItem
                  key={option}
                  onSelect={() => setField.onSelect(option)}
                  className="text-[13px]"
                >
                  {setField.renderOption ? setField.renderOption(option) : option}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <button type="button" onClick={onExport} className={barButton}>
          <Download />
          Export
        </button>
        <button
          type="button"
          onClick={onDelete}
          className={cn(barButton, "text-red-400 hover:text-red-300 dark:text-red-600 dark:hover:text-red-700")}
        >
          <Trash2 />
          Delete
        </button>
        <span className="h-4 w-px bg-background/20" />
        <button type="button" onClick={onClear} aria-label="Clear selection" className={barButton}>
          <X />
        </button>
      </div>
    </div>
  );
}
