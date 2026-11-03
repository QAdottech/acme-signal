"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CircleDashed,
  Download,
  Factory,
  MapPin,
  Plus,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddOrganizationModal } from "@/components/add-organization-modal";
import { StageBadge } from "@/components/stage-badge";
import {
  RecordTable,
  useRecordTableState,
  type Column,
} from "@/components/record-table/record-table";
import { CompanyChip, Empty, OwnerCell, StageCell } from "@/components/record-table/cells";
import {
  FilterMenu,
  SearchField,
  countFilters,
  facetOptions,
  type FilterFacet,
  type FilterValues,
} from "@/components/record-table/toolbar";
import { RecordListLayout } from "@/components/record-table/layout";
import { SelectionBar } from "@/components/record-table/selection-bar";
import { getOrganizations, saveOrganizations } from "@/lib/organizationData";
import { exportOrganizationsToCSV } from "@/lib/exportUtils";
import { STAGE_STYLES } from "@/lib/stages";
import { useCreateIntent } from "@/lib/create-intent";
import type { DealStage, Organization } from "@/types/organization";

const STAGES = Object.keys(STAGE_STYLES) as DealStage[];

export function OrganizationsClient() {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  useCreateIntent("company", () => setIsModalOpen(true));
  const [filters, setFilters] = useState<FilterValues>({});
  const { sort, setSort, selectedIds, setSelectedIds } = useRecordTableState({
    columnId: "name",
    direction: "asc",
  });

  useEffect(() => {
    setOrganizations(getOrganizations());
  }, []);

  const persist = (next: Organization[]) => {
    setOrganizations(next);
    saveOrganizations(next);
  };

  const updateOrganization = (id: string, changes: Partial<Organization>, message: string) => {
    persist(organizations.map((org) => (org.id === id ? { ...org, ...changes } : org)));
    toast.success(message);
  };

  const facets: FilterFacet[] = useMemo(
    () => [
      { key: "dealStage", label: "Stage", options: STAGES.filter((s) => organizations.some((o) => o.dealStage === s)) },
      { key: "industry", label: "Industry", options: facetOptions(organizations.map((o) => o.industry)) },
      { key: "location", label: "Location", options: facetOptions(organizations.map((o) => o.location)) },
      { key: "owner", label: "Owner", options: facetOptions(organizations.map((o) => o.owner)) },
    ],
    [organizations]
  );

  const visibleOrganizations = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = (key: string, value: string | undefined) =>
      !filters[key]?.length || (!!value && filters[key].includes(value));
    return organizations.filter((org) => {
      const matchesSearch =
        !term ||
        [org.name, org.industry, org.location, org.owner ?? ""].some((field) =>
          field.toLowerCase().includes(term)
        );
      return (
        matchesSearch &&
        matches("dealStage", org.dealStage) &&
        matches("industry", org.industry) &&
        matches("location", org.location) &&
        matches("owner", org.owner)
      );
    });
  }, [organizations, filters, searchTerm]);

  const columns: Column<Organization>[] = [
    {
      id: "name",
      header: "Company",
      icon: Building2,
      width: 240,
      sortValue: (o) => o.name.toLowerCase(),
      cell: (o) => (
        <span className="font-medium">
          <CompanyChip name={o.name} logo={o.logo} href={`/organizations/${o.id}`} />
        </span>
      ),
      footer: (rows) => `${rows.length} ${rows.length === 1 ? "company" : "companies"}`,
    },
    {
      id: "stage",
      header: "Stage",
      icon: CircleDashed,
      width: 150,
      sortValue: (o) => STAGES.indexOf(o.dealStage),
      cell: (o) => (
        <StageCell
          value={o.dealStage}
          onChange={(stage) => updateOrganization(o.id, { dealStage: stage }, `Moved ${o.name} to ${stage}`)}
        />
      ),
    },
    {
      id: "industry",
      header: "Industry",
      icon: Factory,
      width: 200,
      sortValue: (o) => o.industry.toLowerCase(),
      cell: (o) => o.industry || <Empty />,
    },
    {
      id: "location",
      header: "Location",
      icon: MapPin,
      width: 200,
      sortValue: (o) => o.location.toLowerCase(),
      cell: (o) => o.location || <Empty />,
    },
    {
      id: "employees",
      header: "Employees",
      icon: Users,
      width: 120,
      align: "right",
      firstSortDirection: "desc",
      sortValue: (o) => o.employees,
      cell: (o) => o.employees.toLocaleString("en-US"),
    },
    {
      id: "owner",
      header: "Owner",
      icon: UserRound,
      width: 180,
      sortValue: (o) => (o.owner ?? "").toLowerCase(),
      cell: (o) => (
        <OwnerCell
          value={o.owner}
          onChange={(owner) => updateOrganization(o.id, { owner }, `${owner} now owns ${o.name}`)}
        />
      ),
    },
  ];

  const handleBulkStage = (stage: DealStage) => {
    const count = selectedIds.size;
    persist(organizations.map((org) => (selectedIds.has(org.id) ? { ...org, dealStage: stage } : org)));
    setSelectedIds(new Set());
    toast.success(`Moved ${count} ${count === 1 ? "company" : "companies"} to ${stage}`);
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} companies?`)) return;
    const count = selectedIds.size;
    persist(organizations.filter((org) => !selectedIds.has(org.id)));
    setSelectedIds(new Set());
    toast.success(`Deleted ${count} ${count === 1 ? "company" : "companies"}`);
  };

  const addOrganization = (newOrganization: Omit<Organization, "id">) => {
    const id = Math.random().toString(36).slice(2, 11);
    persist([...organizations, { ...newOrganization, id }]);
    setIsModalOpen(false);
    toast.success(`Added ${newOrganization.name}`);
  };

  const isFiltered = searchTerm !== "" || countFilters(filters) > 0;

  return (
    <RecordListLayout
      title="Companies"
      description={
        isFiltered
          ? `${visibleOrganizations.length} of ${organizations.length} companies`
          : `${organizations.length} companies`
      }
      actions={
        <>
          <Button variant="outline" onClick={() => exportOrganizationsToCSV(visibleOrganizations)}>
            <Download />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus />
            Add Company
          </Button>
        </>
      }
      toolbar={
        <>
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search companies..." />
          <FilterMenu facets={facets} values={filters} onChange={setFilters} />
        </>
      }
    >
      <RecordTable
        rows={visibleOrganizations}
        columns={columns}
        getRowId={(o) => o.id}
        rowLabel={(o) => o.name}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(o) => router.push(`/organizations/${o.id}`)}
        emptyState={
          isFiltered
            ? "No companies found matching your criteria."
            : "No companies yet. Click 'Add Company' to get started."
        }
      />

      <SelectionBar
        count={selectedIds.size}
        nouns={["company", "companies"]}
        setField={{
          label: "Set stage",
          options: STAGES,
          renderOption: (stage) => <StageBadge stage={stage} />,
          onSelect: handleBulkStage,
        }}
        onExport={() =>
          exportOrganizationsToCSV(organizations.filter((org) => selectedIds.has(org.id)))
        }
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds(new Set())}
      />

      <AddOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addOrganization}
      />
    </RecordListLayout>
  );
}
