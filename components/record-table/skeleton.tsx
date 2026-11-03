import { Skeleton } from "@/components/ui/skeleton";

/** Loading state matching RecordListLayout, so the page doesn't jump. */
export function RecordListSkeleton({ columns = 6 }: { columns?: number }) {
  return (
    <main className="flex h-full min-h-0 flex-col" aria-busy="true" aria-label="Loading">
      <div className="px-8 pt-6">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-1.5 h-4 w-40" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="mb-3 flex gap-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-24" />
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-hidden border-t">
        {Array.from({ length: 14 }).map((_, row) => (
          <div key={row} className="flex h-9 items-center gap-6 border-b border-border/70 pl-4 pr-8">
            <Skeleton className="h-4 w-4 shrink-0" />
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton
                key={col}
                className="h-3.5"
                style={{ width: `${col === 0 ? 180 : 70 + ((row * 7 + col * 13) % 60)}px` }}
              />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
