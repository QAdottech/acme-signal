"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlignLeft, Building2, DollarSign, List, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RecordListLayout } from "@/components/record-table/layout";
import {
  RecordTable,
  useRecordTableState,
  type Column,
} from "@/components/record-table/record-table";
import { Empty } from "@/components/record-table/cells";
import { SearchField } from "@/components/record-table/toolbar";
import { SelectionBar } from "@/components/record-table/selection-bar";
import { ListDialog } from "@/components/list-dialog";
import { useConfirm } from "@/components/confirm-dialog";
import { createList, deleteList, getCollections, getOrganizations } from "@/lib/organizationData";
import { formatDealValue, getDeals } from "@/lib/dealData";
import { exportToCSV } from "@/lib/exportUtils";
import { listSwatch } from "@/lib/lists";
import { useCreateIntent } from "@/lib/create-intent";
import type { Collection, Organization } from "@/types/organization";
import type { Deal } from "@/types/deal";
import { cn } from "@/lib/utils";

const CLOSED_STAGES = new Set(["Customer", "Closed Lost", "Churned"]);

type ListRow = Collection & {
  companies: Organization[];
  openPipeline: number;
  locations: number;
};

/** All lists as a table; each list opens as a filtered company table. */
export function CollectionsClient() {
  const router = useRouter();
  const confirm = useConfirm();
  const [lists, setLists] = useState<Collection[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  useCreateIntent("list", () => setIsCreateOpen(true));
  const { sort, setSort, selectedIds, setSelectedIds } = useRecordTableState({
    columnId: "name",
    direction: "asc",
  });

  const refresh = useCallback(() => {
    setLists(getCollections());
    setOrganizations(getOrganizations());
  }, []);

  useEffect(() => {
    refresh();
    setDeals(getDeals());
    window.addEventListener("collections-updated", refresh);
    return () => window.removeEventListener("collections-updated", refresh);
  }, [refresh]);

  const rows = useMemo<ListRow[]>(() => {
    const orgById = new Map(organizations.map((org) => [org.id, org]));
    const term = searchTerm.trim().toLowerCase();
    return lists
      .filter((list) => !term || `${list.name} ${list.description}`.toLowerCase().includes(term))
      .map((list) => {
        const companies = list.organizationIds
          .map((id) => orgById.get(id))
          .filter((org): org is Organization => !!org);
        const memberIds = new Set(companies.map((org) => org.id));
        return {
          ...list,
          companies,
          openPipeline: deals
            .filter((deal) => memberIds.has(deal.organizationId) && !CLOSED_STAGES.has(deal.stage))
            .reduce((sum, deal) => sum + deal.value, 0),
          locations: new Set(companies.map((org) => org.location).filter(Boolean)).size,
        };
      });
  }, [lists, organizations, deals, searchTerm]);

  const columns: Column<ListRow>[] = [
    {
      id: "name",
      header: "List",
      icon: List,
      width: 280,
      sortValue: (l) => l.name.toLowerCase(),
      cell: (l) => (
        <Link prefetch={false}
          href={`/collections/${l.id}`}
          className="flex min-w-0 items-center gap-2 font-medium underline-offset-2 hover:underline"
        >
          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", listSwatch(l.id))} />
          <span className="truncate">{l.name}</span>
        </Link>
      ),
      footer: (r) => `${r.length} ${r.length === 1 ? "list" : "lists"}`,
    },
    {
      id: "companies",
      header: "Companies",
      icon: Building2,
      width: 220,
      sortValue: (l) => l.companies.length,
      firstSortDirection: "desc",
      cell: (l) =>
        l.companies.length === 0 ? (
          <Empty />
        ) : (
          <span className="flex items-center gap-2">
            <span className="tabular-nums">{l.companies.length}</span>
            <span className="flex -space-x-1">
              {l.companies.slice(0, 5).map((org) => (
                <span
                  key={org.id}
                  title={org.name}
                  className="flex h-5 w-5 items-center justify-center overflow-hidden rounded border bg-background"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={org.logo} alt="" className="h-full w-full object-cover" />
                </span>
              ))}
            </span>
            {l.companies.length > 5 && (
              <span className="text-xs text-muted-foreground">+{l.companies.length - 5}</span>
            )}
          </span>
        ),
    },
    {
      id: "pipeline",
      header: "Open pipeline",
      icon: DollarSign,
      width: 150,
      align: "right",
      firstSortDirection: "desc",
      sortValue: (l) => l.openPipeline,
      cell: (l) => (l.openPipeline ? <span className="font-medium">{formatDealValue(l.openPipeline)}</span> : <Empty />),
    },
    {
      id: "locations",
      header: "Locations",
      icon: MapPin,
      width: 120,
      align: "right",
      sortValue: (l) => l.locations,
      cell: (l) => l.locations || <Empty />,
    },
    {
      id: "description",
      header: "Description",
      icon: AlignLeft,
      width: 360,
      cell: (l) => <span className="block truncate text-muted-foreground">{l.description || "—"}</span>,
    },
  ];

  const handleDelete = async () => {
    const count = selectedIds.size;
    const ok = await confirm({
      title: `Delete ${count} ${count === 1 ? "list" : "lists"}?`,
      description: "The companies in them are not deleted.",
      confirmLabel: `Delete ${count === 1 ? "list" : "lists"}`,
    });
    if (!ok) return;
    selectedIds.forEach((id) => deleteList(id));
    setSelectedIds(new Set());
    toast.success(`Deleted ${count} ${count === 1 ? "list" : "lists"}`);
  };

  return (
    <RecordListLayout
      title="Lists"
      description={`${lists.length} ${lists.length === 1 ? "list" : "lists"} · groups of companies to work through together`}
      actions={
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus />
          New List
        </Button>
      }
      toolbar={<SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search lists..." />}
    >
      <RecordTable
        rows={rows}
        columns={columns}
        getRowId={(l) => l.id}
        rowLabel={(l) => l.name}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(l) => router.push(`/collections/${l.id}`)}
        emptyState={searchTerm ? "No lists match your search." : "No lists yet. Click 'New List' to group your companies."}
      />

      <SelectionBar
        count={selectedIds.size}
        nouns={["list", "lists"]}
        onExport={() =>
          exportToCSV(
            rows
              .filter((l) => selectedIds.has(l.id))
              .map((l) => ({
                name: l.name,
                description: l.description,
                companies: l.companies.map((org) => org.name),
                openPipeline: l.openPipeline,
              })),
            `lists-${new Date().toISOString().split("T")[0]}.csv`
          )
        }
        onDelete={handleDelete}
        onClear={() => setSelectedIds(new Set())}
      />

      <ListDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSave={(details) => {
          const list = createList({ ...details, tags: [] });
          setIsCreateOpen(false);
          toast.success(`Created “${list.name}”`);
          router.push(`/collections/${list.id}`);
        }}
      />
    </RecordListLayout>
  );
}
