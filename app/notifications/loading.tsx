import { Skeleton } from "@/components/ui/skeleton";

export default function NotificationsLoading() {
  return (
    <main className="container py-8 max-w-[900px] mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-24" />
        <div className="ml-auto">
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Time group header */}
      <Skeleton className="h-5 w-20 mb-3" />

      {/* Notification items */}
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg"
          >
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <Skeleton className="w-2 h-2 rounded-full flex-shrink-0 mt-2" />
          </div>
        ))}
      </div>

      {/* Second group */}
      <Skeleton className="h-5 w-24 mb-3 mt-6" />
      <div className="space-y-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 rounded-lg"
          >
            <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
