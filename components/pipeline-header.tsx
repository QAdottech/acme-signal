import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import {
  DealViewSwitcher,
  FilterMenu,
  SearchField,
  type FilterFacet,
  type FilterValues,
} from "@/components/record-table/toolbar";
import { formatDealValue } from "@/lib/dealData";

interface PipelineHeaderProps {
  openModal: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  facets: FilterFacet[];
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
  totalValue: number;
  dealCount: number;
}

/** Header for the deals board: same toolbar as the Deals table view. */
export function PipelineHeader({
  openModal,
  searchTerm,
  onSearchChange,
  facets,
  filters,
  onFiltersChange,
  totalValue,
  dealCount,
}: PipelineHeaderProps) {
  return (
    <div className="space-y-4">
      <PageHeader
        className="mb-0"
        title="Sales Pipeline"
        description={`${dealCount} open ${dealCount === 1 ? "deal" : "deals"} · ${formatDealValue(totalValue)} open pipeline`}
        actions={
          <Button onClick={openModal}>
            <Plus />
            Add Deal
          </Button>
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <DealViewSwitcher current="board" />
        <span className="mx-1 h-5 w-px bg-border" />
        <SearchField value={searchTerm} onChange={onSearchChange} placeholder="Filter deals..." />
        <FilterMenu facets={facets} values={filters} onChange={onFiltersChange} />
      </div>
    </div>
  );
}
