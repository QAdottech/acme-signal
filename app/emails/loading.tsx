import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function EmailsLoading() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-8 py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Button
          disabled
          
        >
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            disabled
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-14 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-14 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-md" />
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-lg border bg-white dark:bg-gray-900"
          >
            <Skeleton className="w-10 h-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    </main>
  );
}
