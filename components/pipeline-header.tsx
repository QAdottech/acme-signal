import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Star, Search, X, ChevronsUpDown, Check } from "lucide-react";
import { FilterPopover } from "@/components/filter-popover";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  onSwimlanesChange: (value: string) => void;
}

export function PipelineHeader({
  openModal,
  searchTerm,
  onSearchChange,
  filters,
  setFilters,
  onSwimlanesChange,
}: PipelineHeaderProps) {
  const [swimlanesOpen, setSwimlanesOpen] = useState(false);
  const [selectedSwimlanesValue, setSelectedSwimlanesValue] =
    useState("no-swimlanes");
  const totalFilters = Object.values(filters).flat().length;

  const clearFilters = () => {
    setFilters({ location: [], dealStage: [], industry: [] });
  };

  const swimlanesOptions = [
    { value: "no-swimlanes", label: "No swimlanes" },
    { value: "industry", label: "Industry" },
    { value: "location", label: "Location" },
  ];

  const handleSwimlanesSelect = (value: string) => {
    setSelectedSwimlanesValue(value);
    onSwimlanesChange(value);
    setSwimlanesOpen(false);
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
              All Stages
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              Active
            </span>
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
              Global
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" className="gap-2">
          <Star className="w-4 h-4" />
          Favorite
        </Button>
      </div>
      <div className="flex items-center gap-4 border-t pt-6">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter organizations..."
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
        <Popover open={swimlanesOpen} onOpenChange={setSwimlanesOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={swimlanesOpen}
              className="w-[180px] justify-between"
            >
              {swimlanesOptions.find(
                (option) => option.value === selectedSwimlanesValue
              )?.label || "Select swimlanes"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[180px] p-0">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandEmpty>No option found.</CommandEmpty>
              <CommandGroup>
                {swimlanesOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSwimlanesSelect(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedSwimlanesValue === option.value
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
