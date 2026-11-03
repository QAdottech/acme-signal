import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, X, Plus } from "lucide-react";
import { FilterPopover } from "@/components/filter-popover";
import { cn } from "@/lib/utils";
import { formatDealValue } from "@/lib/dealData";
import { PageHeader } from "@/components/page-header";

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
    <div className="space-y-4">
      <PageHeader
        className="mb-0"
        title="Sales Pipeline"
        description={`${dealCount} deals · ${formatDealValue(totalValue)} total value`}
        actions={
          <Button onClick={openModal}>
            <Plus />
            Add Deal
          </Button>
        }
      />
      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter deals..."
            value={searchTerm}
            onChange={onSearchChange}
            className="pl-8 w-full "
          />
        </div>
        <FilterPopover filters={filters} setFilters={setFilters}>
          <Button
            variant="outline"
            className={cn(
              "",
              totalFilters > 0 &&
                "bg-accent border-foreground/20 text-foreground"
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
            className="text-muted-foreground"
          >
            <X className="w-4 h-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
}
