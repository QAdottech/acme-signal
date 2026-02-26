import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X, Plus } from "lucide-react";
import { FilterPopover } from "@/components/filter-popover";
import { cn } from "@/lib/utils";
import { formatDealValue } from "@/lib/dealData";

interface PipelineHeaderProps {
  openModal: () => void;
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  filters: {
    location: string[];
    dealStage: string[];
    industry: string[];
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      location: string[];
      dealStage: string[];
      industry: string[];
    }>
  >;
  totalValue: number;
  dealCount: number;
}

export function PipelineHeader({
  openModal,
  searchTerm,
  onSearchChange,
  filters,
  setFilters,
  totalValue,
  dealCount,
}: PipelineHeaderProps) {
  const totalFilters = Object.values(filters).flat().length;

  const clearFilters = () => {
    setFilters({ location: [], dealStage: [], industry: [] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Sales Pipeline
          </h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {dealCount} deals
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              {formatDealValue(totalValue)} total value
            </span>
          </div>
        </div>
        <Button
          onClick={openModal}
          size="sm"
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Deal
        </Button>
      </div>
      <div className="flex items-center gap-4 border-t pt-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter deals..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-8 w-full bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
          />
        </div>
        <FilterPopover filters={filters} setFilters={setFilters}>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
              totalFilters > 0 &&
                "bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100"
            )}
          >
            <Filter className="w-4 h-4" />
            Filters {totalFilters > 0 && `(${totalFilters})`}
          </Button>
        </FilterPopover>
        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="gap-2 text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
