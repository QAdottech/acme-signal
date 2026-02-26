import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FilterPopoverProps {
  children: React.ReactNode;
  filters: {
    location: string[];
    dealStage: string[];
    industry: string[];
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    location: string[];
    dealStage: string[];
    industry: string[];
  }>>;
}

const filterOptions = {
  location: ['Stockholm', 'Helsinki', 'San Francisco', 'New York', 'Copenhagen', 'Austin', 'Amsterdam'],
  dealStage: ['New', 'Lead', 'Qualified', 'Proposal', 'Negotiation', 'Customer', 'Churned', 'Closed Lost'],
  industry: ['Music', 'Food', 'Software testing', 'Web Development', 'HR Technology', 'Gaming', 'Fintech', 'Contract Management', 'Developer Tools', 'Analytics', 'Artificial Intelligence', 'E-commerce AI', 'EdTech', 'Design Tools', 'Biotechnology', 'Financial Technology', 'Legal Technology'],
};

export function FilterPopover({ children, filters, setFilters }: FilterPopoverProps) {
  const handleFilterChange = (type: keyof typeof filters, value: string) => {
    setFilters(prevFilters => {
      const updatedFilters = { ...prevFilters };
      if (updatedFilters[type].includes(value)) {
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value);
      } else {
        updatedFilters[type] = [...updatedFilters[type], value];
      }
      return updatedFilters;
    });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4 bg-white rounded-md shadow-md border border-gray-200">
        <div className="mb-3">
          <h4 className="text-sm font-semibold mb-1">Filters</h4>
          <p className="text-xs text-gray-500">
            Select filters to apply to the pipeline view.
          </p>
        </div>
        <div className="space-y-3">
          {Object.entries(filterOptions).map(([key, options]) => (
            <div key={key}>
              <h5 className="text-xs font-semibold mb-1">{key === 'industry' ? 'Industry' : key === 'dealStage' ? 'Deal Stage' : key.charAt(0).toUpperCase() + key.slice(1)}</h5>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                {options.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`${key}-${option}`}
                      checked={filters[key as keyof typeof filters].includes(option)}
                      onCheckedChange={() => handleFilterChange(key as keyof typeof filters, option)}
                      className={cn(
                        "peer h-3 w-3 shrink-0 rounded-sm border border-gray-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500",
                        "flex items-center justify-center [&>span]:h-2 [&>span]:w-2"
                      )}
                    />
                    <Label
                      htmlFor={`${key}-${option}`}
                      className="text-xs font-light leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
