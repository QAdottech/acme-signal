"use client";

import { useState, useEffect } from "react";
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
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AddOrganizationModal } from "@/components/add-organization-modal";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import Link from "next/link";
import type { Organization } from "@/types/organization";
import { FilterPopover } from "@/components/filter-popover";
import { cn } from "@/lib/utils";
import { OrganizationImage } from "@/components/organization-image";
import { getOrganizations } from "@/lib/organizationData";
import { Checkbox } from "@/components/ui/checkbox";
import { exportOrganizationsToCSV } from "@/lib/exportUtils";

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

type SortField =
  | "name"
  | "industry"
  | "location"
  | "employees"
  | "dealStage"
  | "owner";
type SortDirection = "asc" | "desc";

export function OrganizationsClient() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState({
    location: [] as string[],
    dealStage: [] as string[],
    industry: [] as string[],
  });
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  useEffect(() => {
    setOrganizations(getOrganizations());
  }, []);

  const saveOrganizations = (newOrganizations: Organization[]) => {
    setOrganizations(newOrganizations);
    localStorage.setItem("organizations", JSON.stringify(newOrganizations));
  };

  const addOrganization = (newOrganization: Omit<Organization, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const updatedOrganizations = [...organizations, { ...newOrganization, id }];
    saveOrganizations(updatedOrganizations);
    setIsModalOpen(false);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortOrganizations = (orgs: Organization[]) => {
    return [...orgs].sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "industry":
          aValue = a.industry.toLowerCase();
          bValue = b.industry.toLowerCase();
          break;
        case "location":
          aValue = a.location.toLowerCase();
          bValue = b.location.toLowerCase();
          break;
        case "employees":
          aValue = a.employees;
          bValue = b.employees;
          break;
        case "dealStage":
          aValue = a.dealStage.toLowerCase();
          bValue = b.dealStage.toLowerCase();
          break;
        case "owner":
          aValue = (a.owner || "").toLowerCase();
          bValue = (b.owner || "").toLowerCase();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredOrganizations = sortOrganizations(
    organizations.filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.owner || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
        filters.location.length === 0 ||
        filters.location.includes(org.location);
      const matchesStatus =
        filters.dealStage.length === 0 ||
        filters.dealStage.includes(org.dealStage);
      const matchesIndustry =
        filters.industry.length === 0 ||
        filters.industry.includes(org.industry);
      return (
        matchesSearch && matchesLocation && matchesStatus && matchesIndustry
      );
    })
  );

  const clearFilters = () => {
    setFilters({
      location: [] as string[],
      dealStage: [] as string[],
      industry: [] as string[],
    });
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
    if (selectedIds.size === filteredOrganizations.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredOrganizations.map((org) => org.id)));
    }
  };

  const handleBulkStatusChange = (status: string) => {
    const updatedOrganizations = organizations.map((org) =>
      selectedIds.has(org.id)
        ? { ...org, dealStage: status as Organization["dealStage"] }
        : org
    );
    saveOrganizations(updatedOrganizations);
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedOrgs = organizations.filter((org) => selectedIds.has(org.id));
    exportOrganizationsToCSV(selectedOrgs);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.size} organizations?`
      )
    ) {
      const updatedOrganizations = organizations.filter(
        (org) => !selectedIds.has(org.id)
      );
      saveOrganizations(updatedOrganizations);
      setSelectedIds(new Set());
    }
  };

  const handleExportAll = () => {
    exportOrganizationsToCSV(filteredOrganizations);
  };

  return (
      <main className="container py-8 max-w-[1400px] mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Organizations</h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {filteredOrganizations.length === organizations.length
                  ? `${organizations.length} companies`
                  : `${filteredOrganizations.length} of ${organizations.length} companies`}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleExportAll}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Plus className="w-4 h-4" />
                Add Organization
              </Button>
            </div>
          </div>
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-grow max-w-md">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
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
                  "gap-2 bg-white border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
                  Object.values(filters).flat().length > 0 &&
                    "bg-orange-50 border-orange-300 text-orange-600 hover:bg-orange-100"
                )}
              >
                <Filter className="w-4 h-4" />
                Filters{" "}
                {Object.values(filters).flat().length > 0 &&
                  `(${Object.values(filters).flat().length})`}
              </Button>
            </FilterPopover>
            {Object.values(filters).flat().length > 0 && (
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
                      selectedIds.size === filteredOrganizations.length &&
                      filteredOrganizations.length > 0
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Logo</TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-2">
                    Name
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                  onClick={() => handleSort("industry")}
                >
                  <div className="flex items-center gap-2">
                    Industry
                    {sortField === "industry" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                  onClick={() => handleSort("location")}
                >
                  <div className="flex items-center gap-2">
                    Location
                    {sortField === "location" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                  onClick={() => handleSort("employees")}
                >
                  <div className="flex items-center gap-2">
                    Employees
                    {sortField === "employees" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                  onClick={() => handleSort("dealStage")}
                >
                  <div className="flex items-center gap-2">
                    Deal Stage
                    {sortField === "dealStage" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
                  onClick={() => handleSort("owner")}
                >
                  <div className="flex items-center gap-2">
                    Owner
                    {sortField === "owner" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      ))}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrganizations.map((org) => (
                <TableRow
                  key={org.id}
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(org.id)}
                      onCheckedChange={() => toggleSelection(org.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link href={`/organizations/${org.id}`} className="block">
                      <div className="w-10 h-10 relative rounded-full overflow-hidden">
                        <OrganizationImage
                          src={org.logo || "/placeholder.svg"}
                          alt={`${org.name} logo`}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link href={`/organizations/${org.id}`} className="block">
                      {org.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/organizations/${org.id}`} className="block">
                      {org.industry}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/organizations/${org.id}`} className="block">
                      {org.location}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/organizations/${org.id}`} className="block">
                      {org.employees}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/organizations/${org.id}`} className="block">
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", stageColors[org.dealStage] || "bg-gray-100 text-gray-700")}>{org.dealStage}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/organizations/${org.id}`} className="block">
                      {org.owner || "-"}
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredOrganizations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || Object.values(filters).flat().length > 0
                  ? "No organizations found matching your criteria."
                  : "No organizations yet. Click 'Add Organization' to get started."}
              </p>
            </div>
          )}
          <AddOrganizationModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onAdd={addOrganization}
          />
          <BulkActionsBar
            selectedCount={selectedIds.size}
            onClearSelection={() => setSelectedIds(new Set())}
            onChangeStatus={handleBulkStatusChange}
            onExport={handleBulkExport}
            onDelete={handleBulkDelete}
          />
      </main>
  );
}
