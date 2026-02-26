"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
  Download,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import { getDeals, saveDeals, addDeal, formatDealValue } from "@/lib/dealData";
import { getOrganizations } from "@/lib/organizationData";
import { AddDealModal } from "@/components/add-deal-modal";
import { OrganizationImage } from "@/components/organization-image";
import { Checkbox } from "@/components/ui/checkbox";
import { FilterPopover } from "@/components/filter-popover";
import { cn } from "@/lib/utils";

type SortField =
  | "title"
  | "company"
  | "value"
  | "stage"
  | "owner"
  | "expectedCloseDate"
  | "probability";
type SortDirection = "asc" | "desc";

const stageColors: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  Lead: "bg-blue-100 text-blue-700",
  Qualified: "bg-orange-100 text-orange-700",
  Proposal: "bg-purple-100 text-purple-700",
  Negotiation: "bg-amber-100 text-amber-700",
  Customer: "bg-green-100 text-green-700",
  Churned: "bg-red-100 text-red-700",
  "Closed Lost": "bg-red-100 text-red-700",
};

export function DealsClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    location: [] as string[],
    dealStage: [] as string[],
    industry: [] as string[],
  });
  const [sortField, setSortField] = useState<SortField>("value");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    setDeals(getDeals());
    setOrganizations(getOrganizations());
  }, []);

  const orgMap = useMemo(() => {
    const map: Record<string, Organization> = {};
    organizations.forEach((org) => {
      map[org.id] = org;
    });
    return map;
  }, [organizations]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "value" || field === "probability" ? "desc" : "asc");
    }
  };

  const sortDeals = (d: Deal[]) => {
    return [...d].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "title":
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case "company":
          aValue = (orgMap[a.organizationId]?.name || "").toLowerCase();
          bValue = (orgMap[b.organizationId]?.name || "").toLowerCase();
          break;
        case "value":
          aValue = a.value;
          bValue = b.value;
          break;
        case "stage":
          aValue = a.stage.toLowerCase();
          bValue = b.stage.toLowerCase();
          break;
        case "owner":
          aValue = a.owner.toLowerCase();
          bValue = b.owner.toLowerCase();
          break;
        case "expectedCloseDate":
          aValue = a.expectedCloseDate;
          bValue = b.expectedCloseDate;
          break;
        case "probability":
          aValue = a.probability;
          bValue = b.probability;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredDeals = sortDeals(
    deals.filter((deal) => {
      const org = orgMap[deal.organizationId];
      const matchesSearch =
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        deal.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
        filters.location.length === 0 ||
        (org && filters.location.includes(org.location));
      const matchesStage =
        filters.dealStage.length === 0 ||
        filters.dealStage.includes(deal.stage);
      const matchesIndustry =
        filters.industry.length === 0 ||
        (org && filters.industry.includes(org.industry));
      return matchesSearch && matchesLocation && matchesStage && matchesIndustry;
    })
  );

  const totalFilters = Object.values(filters).flat().length;

  const clearFilters = () => {
    setFilters({ location: [], dealStage: [], industry: [] });
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDeals.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDeals.map((d) => d.id)));
    }
  };

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedIds.size} deals?`)) {
      const updated = deals.filter((d) => !selectedIds.has(d.id));
      setDeals(updated);
      saveDeals(updated);
      setSelectedIds(new Set());
    }
  };

  const handleBulkStageChange = (stage: string) => {
    const updated = deals.map((d) =>
      selectedIds.has(d.id)
        ? { ...d, stage: stage as Deal["stage"] }
        : d
    );
    setDeals(updated);
    saveDeals(updated);
    setSelectedIds(new Set());
  };

  const handleExport = () => {
    const selectedDeals = deals.filter((d) => selectedIds.has(d.id));
    const rows = selectedDeals.map((d) => {
      const org = orgMap[d.organizationId];
      return [
        d.title,
        org?.name || "",
        d.value,
        d.stage,
        d.owner,
        d.expectedCloseDate,
        d.probability,
      ].join(",");
    });
    const csv = ["Title,Company,Value,Stage,Owner,Close Date,Probability", ...rows].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deals-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = () => {
    const rows = filteredDeals.map((d) => {
      const org = orgMap[d.organizationId];
      return [
        d.title,
        org?.name || "",
        d.value,
        d.stage,
        d.owner,
        d.expectedCloseDate,
        d.probability,
      ].join(",");
    });
    const csv = ["Title,Company,Value,Stage,Owner,Close Date,Probability", ...rows].join(
      "\n"
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "deals-export.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddDeal = (dealData: Omit<Deal, "id" | "createdAt">) => {
    const newDeal = addDeal(dealData);
    setDeals([...deals, newDeal]);
    setIsModalOpen(false);
  };

  const totalValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      sortDirection === "asc" ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )
    ) : null;

  return (
    <main className="container py-8 max-w-[1400px] mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {filteredDeals.length === deals.length
              ? `${deals.length} deals`
              : `${filteredDeals.length} of ${deals.length} deals`}
            {" · "}
            {formatDealValue(totalValue)} total value
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleExportAll} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Deal
          </Button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
          />
        </div>
        <FilterPopover filters={filters} setFilters={setFilters}>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "gap-2 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400",
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  selectedIds.size === filteredDeals.length &&
                  filteredDeals.length > 0
                }
                onCheckedChange={toggleSelectAll}
              />
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center gap-2">
                Title
                <SortIcon field="title" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("company")}
            >
              <div className="flex items-center gap-2">
                Company
                <SortIcon field="company" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("value")}
            >
              <div className="flex items-center gap-2">
                Value
                <SortIcon field="value" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("stage")}
            >
              <div className="flex items-center gap-2">
                Stage
                <SortIcon field="stage" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("owner")}
            >
              <div className="flex items-center gap-2">
                Owner
                <SortIcon field="owner" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("expectedCloseDate")}
            >
              <div className="flex items-center gap-2">
                Close Date
                <SortIcon field="expectedCloseDate" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("probability")}
            >
              <div className="flex items-center gap-2">
                Prob.
                <SortIcon field="probability" />
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredDeals.map((deal) => {
            const org = orgMap[deal.organizationId];
            return (
              <TableRow
                key={deal.id}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(deal.id)}
                    onCheckedChange={() => toggleSelection(deal.id)}
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Link href={`/deals/${deal.id}`} className="block">
                    {deal.title}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/organizations/${deal.organizationId}`}
                    className="flex items-center gap-2 hover:text-orange-600 transition-colors"
                  >
                    {org && (
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                        <OrganizationImage
                          src={org.logo}
                          alt={org.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      </div>
                    )}
                    <span className="truncate">{org?.name || "Unknown"}</span>
                  </Link>
                </TableCell>
                <TableCell className="font-semibold">
                  <Link href={`/deals/${deal.id}`} className="block">
                    {formatDealValue(deal.value)}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/deals/${deal.id}`} className="block">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium",
                        stageColors[deal.stage] || "bg-gray-100 text-gray-700"
                      )}
                    >
                      {deal.stage}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/deals/${deal.id}`} className="block text-sm">
                    {deal.owner}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/deals/${deal.id}`} className="block text-sm">
                    {new Date(deal.expectedCloseDate).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric" }
                    )}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/deals/${deal.id}`} className="block text-sm">
                    {deal.probability}%
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || totalFilters > 0
              ? "No deals found matching your criteria."
              : "No deals yet. Click 'Add Deal' to get started."}
          </p>
        </div>
      )}

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-orange-500 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4">
            <span className="font-medium">{selectedIds.size} selected</span>
            <div className="h-6 w-px bg-orange-300" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-white hover:bg-orange-600"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkDelete}
              className="text-white hover:bg-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <div className="h-6 w-px bg-orange-300" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-white hover:bg-orange-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <AddDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDeal}
      />
    </main>
  );
}
