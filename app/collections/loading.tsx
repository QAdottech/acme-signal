import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CollectionsLoading() {
  return (
    <main className="container py-8 max-w-[1400px] mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-8 w-32" />
        <Button
          disabled
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Collection
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="overflow-hidden border-0">
            <div className="bg-[#2D1A45] p-6 pb-8 h-48">
              <Skeleton className="h-6 w-48 bg-white/20" />
              <Skeleton className="h-4 w-64 mt-2 bg-white/10" />
              <div className="flex gap-3 mt-6">
                <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
                <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
                <Skeleton className="w-8 h-8 rounded-lg bg-white/20" />
              </div>
            </div>
            <CardContent className="pt-6 pb-6">
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="w-10 h-10 rounded-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
