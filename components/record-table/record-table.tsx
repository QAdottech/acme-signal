"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc";
export type SortState = { columnId: string; direction: SortDirection };

export interface Column<T> {
  id: string;
  header: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Fixed width in px. Columns without a width share leftover space. */
  width?: number;
  align?: "left" | "right";
  /** Providing this makes the column sortable. */
  sortValue?: (row: T) => string | number;
  /** Direction used the first time this column is sorted. */
  firstSortDirection?: SortDirection;
  cell: (row: T) => React.ReactNode;
  /** Optional summary shown in the footer row (e.g. a sum). */
  footer?: (rows: T[]) => React.ReactNode;
}

/** Sort + selection state for a record table, kept by the page. */
export function useRecordTableState(initialSort: SortState) {
  const [sort, setSort] = useState<SortState>(initialSort);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  return { sort, setSort, selectedIds, setSelectedIds };
}

export function sortRows<T>(rows: T[], columns: Column<T>[], sort: SortState): T[] {
  const column = columns.find((c) => c.id === sort.columnId);
  if (!column?.sortValue) return rows;
  const value = column.sortValue;
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = value(a);
    const bv = value(b);
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * factor;
    return String(av).localeCompare(String(bv), undefined, { numeric: true }) * factor;
  });
}

const EMPTY_SET: Set<string> = new Set();

/** Elements inside a row that handle their own clicks. */
const INTERACTIVE = "a, button, input, select, textarea, [role=checkbox], [role=menu], [data-row-click=ignore]";

/**
 * Attio-style record grid: dense rows, column icons, sticky header, light
 * vertical rules, a selection column, and a summary footer.
 *
 * Rendered inside a scroll container (see RecordListLayout) so the header
 * sticks while rows scroll.
 */
export function RecordTable<T>({
  rows,
  columns,
  getRowId,
  sort,
  onSortChange,
  selectedIds: selectedIdsProp,
  onSelectionChange,
  onRowClick,
  rowLabel,
  emptyState,
  selectable = true,
  rowClassName,
}: {
  rows: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  sort: SortState;
  onSortChange: (sort: SortState) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (ids: Set<string>) => void;
  onRowClick?: (row: T) => void;
  /** Accessible name for a row's checkbox, e.g. the record's name. */
  rowLabel: (row: T) => string;
  emptyState: React.ReactNode;
  /** Show the checkbox column for bulk actions. Defaults to true. */
  selectable?: boolean;
  /** Extra classes per row, e.g. to dim completed tasks. */
  rowClassName?: (row: T) => string | undefined;
}) {
  const selectedIds = selectedIdsProp ?? EMPTY_SET;
  const sortedRows = useMemo(() => sortRows(rows, columns, sort), [rows, columns, sort]);
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.has(getRowId(row)));
  const someSelected = !allSelected && rows.some((row) => selectedIds.has(getRowId(row)));
  const hasFooter = columns.some((c) => c.footer);
  const checkboxWidth = selectable ? 44 : 0;
  const minWidth = checkboxWidth + columns.reduce((sum, c) => sum + (c.width ?? 160), 0);

  const toggleAll = () => {
    onSelectionChange?.(allSelected ? new Set() : new Set(rows.map(getRowId)));
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectionChange?.(next);
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortValue) return;
    if (sort.columnId === column.id) {
      onSortChange({ columnId: column.id, direction: sort.direction === "asc" ? "desc" : "asc" });
    } else {
      onSortChange({ columnId: column.id, direction: column.firstSortDirection ?? "asc" });
    }
  };

  return (
    <table className="w-full table-fixed border-separate border-spacing-0 text-[13px]" style={{ minWidth }}>
      <colgroup>
        {selectable && <col style={{ width: 44 }} />}
        {columns.map((column) => (
          <col key={column.id} style={column.width ? { width: column.width } : undefined} />
        ))}
      </colgroup>
      <thead>
        <tr>
          {selectable && (
            <th className="sticky top-0 z-10 h-9 border-b bg-background pl-4 pr-1 text-left">
              <Checkbox
                aria-label="Select all"
                checked={allSelected ? true : someSelected ? "indeterminate" : false}
                onCheckedChange={toggleAll}
              />
            </th>
          )}
          {columns.map((column) => {
            const sorted = sort.columnId === column.id;
            const Icon = column.icon;
            const content = (
              <span
                className={cn(
                  "flex min-w-0 items-center gap-1.5",
                  column.align === "right" && "flex-row-reverse"
                )}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground/80" />}
                <span className="truncate">{column.header}</span>
                {sorted &&
                  (sort.direction === "asc" ? (
                    <ArrowUp className="h-3 w-3 shrink-0 text-foreground" />
                  ) : (
                    <ArrowDown className="h-3 w-3 shrink-0 text-foreground" />
                  ))}
              </span>
            );
            return (
              <th
                key={column.id}
                scope="col"
                aria-sort={sorted ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                className={cn(
                  "sticky top-0 z-10 h-9 border-b border-l border-l-border/60 bg-background px-3 text-xs font-medium text-muted-foreground first:border-l-0 first:pl-6",
                  column.align === "right" ? "text-right" : "text-left"
                )}
              >
                {column.sortValue ? (
                  <button
                    type="button"
                    onClick={() => handleSort(column)}
                    className={cn(
                      "-mx-1 flex w-[calc(100%+0.5rem)] items-center rounded px-1 py-1 transition-colors hover:bg-accent hover:text-foreground",
                      sorted && "text-foreground"
                    )}
                  >
                    {content}
                  </button>
                ) : (
                  content
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {sortedRows.map((row) => {
          const id = getRowId(row);
          const selected = selectedIds.has(id);
          return (
            <tr
              key={id}
              data-state={selected ? "selected" : undefined}
              onClick={(event) => {
                if (!onRowClick) return;
                if ((event.target as HTMLElement).closest(INTERACTIVE)) return;
                onRowClick(row);
              }}
              className={cn(
                "group transition-colors",
                onRowClick && "cursor-pointer",
                selected ? "bg-blue-50/70 dark:bg-blue-500/10" : "hover:bg-muted/50",
                rowClassName?.(row)
              )}
            >
              {selectable && (
                <td className="h-9 border-b border-border/70 pl-4 pr-1">
                  <Checkbox
                    aria-label={`Select ${rowLabel(row)}`}
                    checked={selected}
                    onCheckedChange={() => toggleRow(id)}
                    className={cn(
                      "transition-opacity",
                      !selected && selectedIds.size === 0 && "opacity-40 group-hover:opacity-100 focus-visible:opacity-100"
                    )}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td
                  key={column.id}
                  className={cn(
                    "h-9 overflow-hidden whitespace-nowrap border-b border-l border-border/70 border-l-border/60 px-3 first:border-l-0 first:pl-6",
                    column.align === "right" && "text-right tabular-nums"
                  )}
                >
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          );
        })}
        {sortedRows.length === 0 && (
          <tr>
            <td colSpan={columns.length + (selectable ? 1 : 0)} className="py-16 text-center text-sm text-muted-foreground">
              {emptyState}
            </td>
          </tr>
        )}
      </tbody>
      {hasFooter && sortedRows.length > 0 && (
        <tfoot>
          <tr>
            {selectable && <td className="sticky bottom-0 h-9 border-t bg-background pl-4" />}
            {columns.map((column) => (
              <td
                key={column.id}
                className={cn(
                  "sticky bottom-0 h-9 overflow-hidden whitespace-nowrap border-l border-t border-l-border/60 bg-background px-3 text-xs text-muted-foreground first:border-l-0 first:pl-6",
                  column.align === "right" && "text-right tabular-nums"
                )}
              >
                {column.footer?.(sortedRows)}
              </td>
            ))}
          </tr>
        </tfoot>
      )}
    </table>
  );
}
