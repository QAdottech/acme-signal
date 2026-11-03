"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  CircleDashed,
  DollarSign,
  Download,
  Percent,
  Plus,
  Type,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddDealModal } from "@/components/add-deal-modal";
import { StageBadge } from "@/components/stage-badge";
import {
  RecordTable,
  useRecordTableState,
  type Column,
} from "@/components/record-table/record-table";
import {
  CompanyChip,
  Empty,
  OwnerCell,
  PrimaryCell,
  StageCell,
} from "@/components/record-table/cells";
import {
  DealViewSwitcher,
  FilterMenu,
  SearchField,
  countFilters,
  emptyFilters,
  facetOptions,
  type FilterFacet,
  type FilterValues,
} from "@/components/record-table/toolbar";
import { RecordListLayout } from "@/components/record-table/layout";
import { SelectionBar } from "@/components/record-table/selection-bar";
import { addDeal, formatDealValue, getDeals, saveDeals, withStage } from "@/lib/dealData";
import { getOrganizations } from "@/lib/organizationData";
import { exportDealsToCSV } from "@/lib/exportUtils";
import { STAGE_STYLES } from "@/lib/stages";
import { formatDate } from "@/lib/format";
import { useCreateIntent } from "@/lib/create-intent";
import type { Deal } from "@/types/deal";
import type { DealStage, Organization } from "@/types/organization";

const STAGES = Object.keys(STAGE_STYLES) as DealStage[];

export function DealsClient() {
  const router = useRouter();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  useCreateIntent("deal", () => setIsModalOpen(true));
  const { sort, setSort, selectedIds, setSelectedIds } = useRecordTableState({
    columnId: "value",
    direction: "desc",
  });

  useEffect(() => {
    setDeals(getDeals());
    setOrganizations(getOrganizations());
  }, []);

  const orgById = useMemo(
    () => new Map(organizations.map((org) => [org.id, org])),
    [organizations]
  );
  const orgName = (id: string) => orgById.get(id)?.name ?? "";

  const facets: FilterFacet[] = useMemo(
    () => [
      { key: "stage", label: "Stage", options: STAGES.filter((s) => deals.some((d) => d.stage === s)) },
      { key: "owner", label: "Owner", options: facetOptions(deals.map((d) => d.owner)) },
      { key: "industry", label: "Industry", options: facetOptions(deals.map((d) => orgById.get(d.organizationId)?.industry)) },
      { key: "location", label: "Location", options: facetOptions(deals.map((d) => orgById.get(d.organizationId)?.location)) },
    ],
    [deals, orgById]
  );
  const [filters, setFilters] = useState<FilterValues>(() => emptyFilters([]));

  const visibleDeals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = (key: string, value: string | undefined) =>
      !filters[key]?.length || (!!value && filters[key].includes(value));
    return deals.filter((deal) => {
      const org = orgById.get(deal.organizationId);
      const matchesSearch =
        !term ||
        deal.title.toLowerCase().includes(term) ||
        (org?.name ?? "").toLowerCase().includes(term) ||
        deal.owner.toLowerCase().includes(term);
      return (
        matchesSearch &&
        matches("stage", deal.stage) &&
        matches("owner", deal.owner) &&
        matches("industry", org?.industry) &&
        matches("location", org?.location)
      );
    });
  }, [deals, filters, orgById, searchTerm]);

  const persist = (next: Deal[]) => {
    setDeals(next);
    saveDeals(next);
  };

  const updateDeal = (id: string, change: (deal: Deal) => Deal, message: string) => {
    persist(deals.map((deal) => (deal.id === id ? change(deal) : deal)));
    toast.success(message);
  };

  const columns: Column<Deal>[] = [
    {
      id: "title",
      header: "Deal",
      icon: Type,
      width: 260,
      sortValue: (d) => d.title.toLowerCase(),
      cell: (d) => <PrimaryCell href={`/deals/${d.id}`}>{d.title}</PrimaryCell>,
      footer: (rows) => `${rows.length} ${rows.length === 1 ? "deal" : "deals"}`,
    },
    {
      id: "company",
      header: "Company",
      icon: Building2,
      width: 190,
      sortValue: (d) => orgName(d.organizationId).toLowerCase(),
      cell: (d) => {
        const org = orgById.get(d.organizationId);
        return org ? (
          <CompanyChip name={org.name} logo={org.logo} href={`/organizations/${org.id}`} />
        ) : (
          <Empty />
        );
      },
    },
    {
      id: "value",
      header: "Value",
      icon: DollarSign,
      width: 120,
      align: "right",
      firstSortDirection: "desc",
      sortValue: (d) => d.value,
      cell: (d) => <span className="font-medium">{formatDealValue(d.value)}</span>,
      footer: (rows) => (
        <>
          <span className="mr-1.5">Sum</span>
          <span className="font-medium text-foreground">
            {formatDealValue(rows.reduce((sum, d) => sum + d.value, 0))}
          </span>
        </>
      ),
    },
    {
      id: "stage",
      header: "Stage",
      icon: CircleDashed,
      width: 150,
      sortValue: (d) => STAGES.indexOf(d.stage),
      cell: (d) => (
        <StageCell
          value={d.stage}
          onChange={(stage) =>
            updateDeal(d.id, (deal) => withStage(deal, stage), `Moved “${d.title}” to ${stage}`)
          }
        />
      ),
    },
    {
      id: "owner",
      header: "Owner",
      icon: UserRound,
      width: 180,
      sortValue: (d) => d.owner.toLowerCase(),
      cell: (d) => (
        <OwnerCell
          value={d.owner}
          onChange={(owner) =>
            updateDeal(d.id, (deal) => ({ ...deal, owner }), `${owner} now owns “${d.title}”`)
          }
        />
      ),
    },
    {
      id: "close",
      header: "Close date",
      icon: CalendarDays,
      width: 130,
      sortValue: (d) => d.expectedCloseDate || "9999",
      cell: (d) => (d.expectedCloseDate ? formatDate(d.expectedCloseDate) : <Empty />),
    },
    {
      id: "probability",
      header: "Probability",
      icon: Percent,
      width: 120,
      align: "right",
      firstSortDirection: "desc",
      sortValue: (d) => d.probability,
      cell: (d) => `${d.probability}%`,
      footer: (rows) => (
        <>
          <span className="mr-1.5">Weighted</span>
          <span className="font-medium text-foreground">
            {formatDealValue(rows.reduce((sum, d) => sum + (d.value * d.probability) / 100, 0))}
          </span>
        </>
      ),
    },
  ];

  const selectedDeals = deals.filter((deal) => selectedIds.has(deal.id));

  const handleBulkStage = (stage: DealStage) => {
    const count = selectedIds.size;
    persist(deals.map((deal) => (selectedIds.has(deal.id) ? withStage(deal, stage) : deal)));
    setSelectedIds(new Set());
    toast.success(`Moved ${count} ${count === 1 ? "deal" : "deals"} to ${stage}`);
  };

  const handleBulkDelete = () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} deals?`)) return;
    const count = selectedIds.size;
    persist(deals.filter((deal) => !selectedIds.has(deal.id)));
    setSelectedIds(new Set());
    toast.success(`Deleted ${count} ${count === 1 ? "deal" : "deals"}`);
  };

  const handleAddDeal = (dealData: Omit<Deal, "id" | "createdAt">) => {
    const newDeal = addDeal(dealData);
    setDeals((prev) => [...prev, newDeal]);
    setIsModalOpen(false);
    toast.success(`Created “${newDeal.title}”`);
  };

  const totalValue = visibleDeals.reduce((sum, d) => sum + d.value, 0);
  const isFiltered = searchTerm !== "" || countFilters(filters) > 0;

  return (
    <RecordListLayout
      title="Deals"
      description={
        <>
          {isFiltered ? `${visibleDeals.length} of ${deals.length} deals` : `${deals.length} deals`}
          {" · "}
          {formatDealValue(totalValue)} total value
        </>
      }
      actions={
        <>
          <Button
            variant="outline"
            onClick={() => exportDealsToCSV(visibleDeals, orgName)}
          >
            <Download />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus />
            Add Deal
          </Button>
        </>
      }
      toolbar={
        <>
          <DealViewSwitcher current="table" />
          <span className="mx-1 h-5 w-px bg-border" />
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search deals..." />
          <FilterMenu facets={facets} values={filters} onChange={setFilters} />
        </>
      }
    >
      <RecordTable
        rows={visibleDeals}
        columns={columns}
        getRowId={(d) => d.id}
        rowLabel={(d) => d.title}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(d) => router.push(`/deals/${d.id}`)}
        emptyState={
          isFiltered
            ? "No deals found matching your criteria."
            : "No deals yet. Click 'Add Deal' to get started."
        }
      />

      <SelectionBar
        count={selectedIds.size}
        nouns={["deal", "deals"]}
        setField={{
          label: "Set stage",
          options: STAGES,
          renderOption: (stage) => <StageBadge stage={stage} />,
          onSelect: handleBulkStage,
        }}
        onExport={() => exportDealsToCSV(selectedDeals, orgName)}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds(new Set())}
      />

      <AddDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDeal}
      />
    </RecordListLayout>
  );
}
