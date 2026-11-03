"use client";

import Link from "next/link";
import { Columns3, ListFilter, Search, Table2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function SearchField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-64">
      <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-8 pr-7"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}

export type FilterFacet = {
  key: string;
  label: string;
  options: string[];
};

export type FilterValues = Record<string, string[]>;

export function emptyFilters(facets: FilterFacet[]): FilterValues {
  return Object.fromEntries(facets.map((facet) => [facet.key, []]));
}

export function countFilters(values: FilterValues) {
  return Object.values(values).reduce((sum, list) => sum + list.length, 0);
}

/** Unique, sorted, non-empty values for a filter facet. */
export function facetOptions(values: (string | undefined | null)[]): string[] {
  return Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) =>
    a.localeCompare(b)
  );
}

/**
 * "Filter" button plus one removable chip per active facet. Options come from
 * the data on the page, so every option matches at least one record.
 */
export function FilterMenu({
  facets,
  values,
  onChange,
}: {
  facets: FilterFacet[];
  values: FilterValues;
  onChange: (values: FilterValues) => void;
}) {
  const active = countFilters(values);

  const toggle = (key: string, option: string) => {
    const current = values[key] ?? [];
    onChange({
      ...values,
      [key]: current.includes(option)
        ? current.filter((value) => value !== option)
        : [...current, option],
    });
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(active > 0 && "border-foreground/20 bg-accent")}
          >
            <ListFilter />
            {active > 0 ? `Filters (${active})` : "Filters"}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-[420px] p-0">
          <div className="flex items-center justify-between border-b px-3 py-2">
            <span className="text-[13px] font-medium">Filter</span>
            {active > 0 && (
              <button
                type="button"
                onClick={() => onChange(Object.fromEntries(facets.map((f) => [f.key, []])))}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="max-h-[360px] space-y-3 overflow-y-auto p-3">
            {facets.map((facet) => (
              <fieldset key={facet.key}>
                <legend className="mb-1.5 text-xs font-medium text-muted-foreground">
                  {facet.label}
                </legend>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  {facet.options.map((option) => {
                    const id = `filter-${facet.key}-${option}`;
                    return (
                      <label
                        key={option}
                        htmlFor={id}
                        className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-[13px] hover:bg-accent"
                      >
                        <Checkbox
                          id={id}
                          checked={(values[facet.key] ?? []).includes(option)}
                          onCheckedChange={() => toggle(facet.key, option)}
                          className="h-3.5 w-3.5"
                        />
                        <span className="truncate">{option}</span>
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {facets
        .filter((facet) => (values[facet.key] ?? []).length > 0)
        .map((facet) => {
          const selected = values[facet.key];
          return (
            <span
              key={facet.key}
              className="inline-flex h-8 items-center gap-1 rounded-md border border-input bg-background pl-2.5 pr-1 text-[13px] shadow-sm"
            >
              <span className="text-muted-foreground">{facet.label}</span>
              <span className="text-muted-foreground">is</span>
              <span className="max-w-[220px] truncate font-medium">
                {selected.length <= 2 ? selected.join(", ") : `${selected.length} values`}
              </span>
              <button
                type="button"
                aria-label={`Remove ${facet.label} filter`}
                onClick={() => onChange({ ...values, [facet.key]: [] })}
                className="ml-0.5 flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          );
        })}
    </>
  );
}

/** Table / Board switch for deals. Each view is its own route. */
export function DealViewSwitcher({ current }: { current: "table" | "board" }) {
  const item = (view: "table" | "board", href: string, label: string, Icon: typeof Table2) => (
    <Link
      href={href}
      aria-current={current === view ? "page" : undefined}
      className={cn(
        "inline-flex h-full items-center gap-1.5 rounded-[5px] px-2.5 text-[13px] font-medium transition-colors",
        current === view
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
  return (
    <nav
      aria-label="Deal views"
      className="inline-flex h-8 items-center gap-0.5 rounded-md border border-input bg-muted/60 p-0.5"
    >
      {item("table", "/deals", "Table", Table2)}
      {item("board", "/", "Board", Columns3)}
    </nav>
  );
}
