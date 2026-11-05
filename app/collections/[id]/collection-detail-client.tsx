"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Pencil, Plus, Search } from "lucide-react";
import { Command as CommandPrimitive } from "cmdk";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StageBadge } from "@/components/stage-badge";
import { RecordListLayout } from "@/components/record-table/layout";
import { RecordTable, useRecordTableState } from "@/components/record-table/record-table";
import {
  FilterMenu,
  SearchField,
  countFilters,
  facetOptions,
  type FilterFacet,
  type FilterValues,
} from "@/components/record-table/toolbar";
import { SelectionBar } from "@/components/record-table/selection-bar";
import { CompanyChip } from "@/components/record-table/cells";
import { RecordNotFound } from "@/components/record-page/blocks";
import { CompanyPeek } from "@/components/records/peeks";
import { companyColumns } from "@/components/records/company-columns";
import { ListDialog } from "@/components/list-dialog";
import {
  addCompaniesToList,
  deleteList,
  getList,
  getOrganizations,
  removeCompaniesFromList,
  updateListDetails,
  updateOrganization,
} from "@/lib/organizationData";
import { formatDealValue, getDeals } from "@/lib/dealData";
import { exportOrganizationsToCSV } from "@/lib/exportUtils";
import { listSwatch } from "@/lib/lists";
import { STAGE_STYLES } from "@/lib/stages";
import type { Collection, DealStage, Organization } from "@/types/organization";
import type { Deal } from "@/types/deal";
import { cn } from "@/lib/utils";

const STAGES = Object.keys(STAGE_STYLES) as DealStage[];
const CLOSED_STAGES = new Set(["Customer", "Closed Lost", "Churned"]);

/**
 * A list is the Companies table filtered to its members, with "Add
 * companies" and "Remove from list" instead of create/delete.
 */
export function CollectionDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [list, setList] = useState<Collection | null | undefined>(undefined);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterValues>({});
  const [peekId, setPeekId] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { sort, setSort, selectedIds, setSelectedIds } = useRecordTableState({
    columnId: "name",
    direction: "asc",
  });

  const refresh = useCallback(() => {
    setList(getList(params.id) ?? null);
    setOrganizations(getOrganizations());
  }, [params.id]);

  useEffect(() => {
    refresh();
    setDeals(getDeals());
    window.addEventListener("collections-updated", refresh);
    return () => window.removeEventListener("collections-updated", refresh);
  }, [refresh]);

  const members = useMemo(
    () => (list ? organizations.filter((org) => list.organizationIds.includes(org.id)) : []),
    [list, organizations]
  );
  const nonMembers = useMemo(
    () => organizations.filter((org) => !members.some((m) => m.id === org.id)),
    [organizations, members]
  );

  const facets: FilterFacet[] = useMemo(
    () => [
      { key: "dealStage", label: "Stage", options: STAGES.filter((s) => members.some((o) => o.dealStage === s)) },
      { key: "industry", label: "Industry", options: facetOptions(members.map((o) => o.industry)) },
      { key: "location", label: "Location", options: facetOptions(members.map((o) => o.location)) },
      { key: "owner", label: "Owner", options: facetOptions(members.map((o) => o.owner)) },
    ],
    [members]
  );

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = (key: string, value: string | undefined) =>
      !filters[key]?.length || (!!value && filters[key].includes(value));
    return members.filter(
      (org) =>
        (!term ||
          [org.name, org.industry, org.location, org.owner ?? ""].some((f) => f.toLowerCase().includes(term))) &&
        matches("dealStage", org.dealStage) &&
        matches("industry", org.industry) &&
        matches("location", org.location) &&
        matches("owner", org.owner)
    );
  }, [members, filters, searchTerm]);

  if (list === undefined) return null;
  if (list === null) return <RecordNotFound noun="list" href="/collections" label="Back to Lists" />;

  const update = (id: string, changes: Partial<Organization>, message: string) => {
    updateOrganization(id, changes);
    setOrganizations(getOrganizations());
    toast.success(message);
  };

  const memberIds = new Set(members.map((org) => org.id));
  const openPipeline = deals
    .filter((deal) => memberIds.has(deal.organizationId) && !CLOSED_STAGES.has(deal.stage))
    .reduce((sum, deal) => sum + deal.value, 0);
  const isFiltered = searchTerm !== "" || countFilters(filters) > 0;

  const handleRemove = () => {
    const count = selectedIds.size;
    if (!removeCompaniesFromList(list.id, Array.from(selectedIds))) {
      toast.error("This list no longer exists. It may have been deleted in another tab.");
      refresh();
      return;
    }
    setSelectedIds(new Set());
    toast.success(`Removed ${count} ${count === 1 ? "company" : "companies"} from ${list.name}`);
  };

  const handleBulkStage = (stage: DealStage) => {
    const count = selectedIds.size;
    selectedIds.forEach((id) => updateOrganization(id, { dealStage: stage }));
    setOrganizations(getOrganizations());
    setSelectedIds(new Set());
    toast.success(`Moved ${count} ${count === 1 ? "company" : "companies"} to ${stage}`);
  };

  return (
    <RecordListLayout
      parent={{ label: "Lists", href: "/collections" }}
      title={list.name}
      description={
        <span className="flex flex-wrap items-center gap-x-2">
          <span className={cn("h-2.5 w-2.5 rounded-[3px]", listSwatch(list.id))} />
          {list.description && <span>{list.description} ·</span>}
          <span>
            {members.length} {members.length === 1 ? "company" : "companies"} · {formatDealValue(openPipeline)} open
            pipeline
          </span>
        </span>
      }
      actions={
        <>
          <Button variant="outline" onClick={() => setIsEditOpen(true)}>
            <Pencil />
            Edit
          </Button>
          <AddCompanies
            candidates={nonMembers}
            onAdd={(org) => {
              if (addCompaniesToList(list.id, [org.id])) {
                toast.success(`Added ${org.name} to ${list.name}`);
              } else {
                toast.error("This list no longer exists. It may have been deleted in another tab.");
                refresh();
              }
            }}
          />
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
        rows={visible}
        columns={companyColumns(update)}
        getRowId={(o) => o.id}
        rowLabel={(o) => o.name}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(o) => setPeekId(o.id)}
        emptyState={
          isFiltered
            ? "No companies in this list match your criteria."
            : "No companies in this list yet. Use “Add companies” to add some."
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
        onExport={() => exportOrganizationsToCSV(members.filter((org) => selectedIds.has(org.id)))}
        onDelete={handleRemove}
        deleteLabel="Remove from list"
        onClear={() => setSelectedIds(new Set())}
      />

      <CompanyPeek
        companyId={peekId}
        onClose={() => setPeekId(null)}
        onChanged={() => setOrganizations(getOrganizations())}
      />

      <ListDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        list={list}
        onSave={(details) => {
          updateListDetails(list.id, details);
          setIsEditOpen(false);
          toast.success("List updated");
        }}
        onDelete={() => {
          deleteList(list.id);
          toast.success(`Deleted ${list.name}`);
          router.push("/collections");
        }}
      />
    </RecordListLayout>
  );
}

/** Search-and-pick menu for adding companies; stays open to add several. */
function AddCompanies({
  candidates,
  onAdd,
}: {
  candidates: Organization[];
  onAdd: (org: Organization) => void;
}) {
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<Set<string>>(new Set());
  return (
    <Popover
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setAdded(new Set());
      }}
    >
      <PopoverTrigger asChild>
        <Button>
          <Plus />
          Add companies
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <CommandPrimitive>
          <div className="flex items-center gap-2 border-b px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <CommandPrimitive.Input
              placeholder="Search companies to add..."
              className="h-10 w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground"
            />
          </div>
          <CommandPrimitive.List className="max-h-72 overflow-y-auto p-1">
            <CommandPrimitive.Empty className="py-6 text-center text-[13px] text-muted-foreground">
              {candidates.length === 0 ? "Every company is already in this list." : "No companies found."}
            </CommandPrimitive.Empty>
            {candidates.map((org) => (
              <CommandPrimitive.Item
                key={org.id}
                value={org.id}
                keywords={[org.name, org.industry]}
                onSelect={() => {
                  onAdd(org);
                  setAdded((prev) => new Set(prev).add(org.id));
                }}
                className="flex h-9 cursor-pointer items-center gap-2 rounded-md px-2 text-[13px] outline-none data-[selected=true]:bg-accent"
              >
                <span className="min-w-0 flex-1">
                  <CompanyChip name={org.name} logo={org.logo} />
                </span>
                {added.has(org.id) && <Check className="h-3.5 w-3.5 text-emerald-600" />}
              </CommandPrimitive.Item>
            ))}
          </CommandPrimitive.List>
        </CommandPrimitive>
      </PopoverContent>
    </Popover>
  );
}
