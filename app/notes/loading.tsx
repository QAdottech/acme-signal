import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

export default function NotesLoading() {
  return (
    <main className="container py-8 max-w-[1000px] mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-32 mt-1.5" />
        </div>
        <Button
          disabled
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            disabled
            className="pl-8 bg-gray-50 dark:bg-gray-800 border-transparent"
          />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border bg-white dark:bg-gray-900 p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-40 mt-1.5" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-3/4 mt-1.5" />
          </div>
        ))}
      </div>
    </main>
  );
}
