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
import { StageBadge } from "@/components/stage-badge";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { useCreateIntent } from "@/lib/create-intent";

type SortField =
  | "title"
  | "company"
  | "value"
  | "stage"
  | "owner"
  | "expectedCloseDate"
  | "probability";
type SortDirection = "asc" | "desc";

export function DealsClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  useCreateIntent("deal", () => setIsModalOpen(true));
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
    <main className="mx-auto w-full max-w-[1400px] px-8 py-6">
      <PageHeader
        title="Deals"
        description={
          <>
            {filteredDeals.length === deals.length
              ? `${deals.length} deals`
              : `${filteredDeals.length} of ${deals.length} deals`}
            {" · "}
            {formatDealValue(totalValue)} total value
          </>
        }
        actions={
          <>
            <Button onClick={handleExportAll} variant="outline">
              <Download />
              Export CSV
            </Button>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus />
              Add Deal
            </Button>
          </>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search deals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
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
              className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
              onClick={() => handleSort("title")}
            >
              <div className="flex items-center gap-2">
                Title
                <SortIcon field="title" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
              onClick={() => handleSort("company")}
            >
              <div className="flex items-center gap-2">
                Company
                <SortIcon field="company" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
              onClick={() => handleSort("value")}
            >
              <div className="flex items-center gap-2">
                Value
                <SortIcon field="value" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
              onClick={() => handleSort("stage")}
            >
              <div className="flex items-center gap-2">
                Stage
                <SortIcon field="stage" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
              onClick={() => handleSort("owner")}
            >
              <div className="flex items-center gap-2">
                Owner
                <SortIcon field="owner" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
              onClick={() => handleSort("expectedCloseDate")}
            >
              <div className="flex items-center gap-2">
                Close Date
                <SortIcon field="expectedCloseDate" />
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
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
                className="cursor-pointer"
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
                    className="flex items-center gap-2 hover:underline underline-offset-2"
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
                    <StageBadge stage={deal.stage} />
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/deals/${deal.id}`} className="block text-sm">
                    {deal.owner}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={`/deals/${deal.id}`} className="block text-sm">
                    {formatDate(deal.expectedCloseDate)}
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
          <div className="bg-foreground text-background rounded-lg shadow-xl px-4 py-2.5 flex items-center gap-4">
            <span className="font-medium">{selectedIds.size} selected</span>
            <div className="h-6 w-px bg-background/20" />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExport}
              className="text-background hover:bg-background/10 hover:text-background"
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
            <div className="h-6 w-px bg-background/20" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="text-background hover:bg-background/10 hover:text-background"
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
