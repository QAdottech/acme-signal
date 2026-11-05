"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddOrganizationModal } from "@/components/add-organization-modal";
import { StageBadge } from "@/components/stage-badge";
import {
  RecordTable,
  useRecordTableState,
} from "@/components/record-table/record-table";
import {
  FilterMenu,
  SearchField,
  countFilters,
  facetOptions,
  type FilterFacet,
  type FilterValues,
} from "@/components/record-table/toolbar";
import { RecordListLayout } from "@/components/record-table/layout";
import { CompanyPeek } from "@/components/records/peeks";
import { companyColumns } from "@/components/records/company-columns";
import { SelectionBar } from "@/components/record-table/selection-bar";
import { getOrganizations, saveOrganizations } from "@/lib/organizationData";
import { exportOrganizationsToCSV } from "@/lib/exportUtils";
import { STAGE_STYLES } from "@/lib/stages";
import { useCreateIntent } from "@/lib/create-intent";
import type { DealStage, Organization } from "@/types/organization";
import { applySearchBug } from "@/lib/demo-bugs";
import { useConfirm } from "@/components/confirm-dialog";

const STAGES = Object.keys(STAGE_STYLES) as DealStage[];

export function OrganizationsClient() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const confirm = useConfirm();
  const [peekId, setPeekId] = useState<string | null>(null);
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

  const matching = useMemo(() => {
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
  const visibleOrganizations = useMemo(() => applySearchBug(matching, searchTerm), [matching, searchTerm]);

  const columns = companyColumns(updateOrganization);

  const handleBulkStage = (stage: DealStage) => {
    const count = selectedIds.size;
    persist(organizations.map((org) => (selectedIds.has(org.id) ? { ...org, dealStage: stage } : org)));
    setSelectedIds(new Set());
    toast.success(`Moved ${count} ${count === 1 ? "company" : "companies"} to ${stage}`);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    const ok = await confirm({
      title: `Delete ${count} ${count === 1 ? "company" : "companies"}?`,
      confirmLabel: `Delete ${count === 1 ? "company" : "companies"}`,
    });
    if (!ok) return;
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
        onRowClick={(o) => setPeekId(o.id)}
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

      <CompanyPeek
        companyId={peekId}
        onClose={() => setPeekId(null)}
        onChanged={(updated) =>
          setOrganizations((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
        }
      />

      <AddOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={addOrganization}
      />
    </RecordListLayout>
  );
}
