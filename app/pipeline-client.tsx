"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { DealCard } from "@/components/deal-card";
import { PipelineHeader } from "@/components/pipeline-header";
import { AddDealModal } from "@/components/add-deal-modal";
import type { Organization, DealStage } from "@/types/organization";
import type { Deal } from "@/types/deal";
import { getOrganizations } from "@/lib/organizationData";
import { getDeals, saveDeals, addDeal, formatDealValue, STAGE_PROBABILITIES, withStage } from "@/lib/dealData";
import { toast } from "sonner";
import { facetOptions, type FilterFacet, type FilterValues } from "@/components/record-table/toolbar";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { getStageStyle } from "@/lib/stages";
import { useCreateIntent } from "@/lib/create-intent";
import { isDemoBugEnabled } from "@/lib/demo-bugs";

const CLOSED_STAGES = new Set(["Customer", "Closed Lost", "Churned"]);

const pipelineStages: { id: string; name: DealStage }[] = [
  { id: "new", name: "New" },
  { id: "lead", name: "Lead" },
  { id: "qualified", name: "Qualified" },
  { id: "proposal", name: "Proposal" },
  { id: "negotiation", name: "Negotiation" },
  { id: "customer", name: "Customer" },
  { id: "closed-lost", name: "Closed Lost" },
];

function DraggableCard({
  deal,
  organization,
}: {
  deal: Deal;
  organization?: Organization;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: deal.id,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealCard deal={deal} organization={organization} />
    </div>
  );
}

function DroppableColumn({
  id,
  title,
  deals,
  organizations,
  isActiveColumn,
  probability,
}: {
  id: string;
  title: string;
  deals: Deal[];
  organizations: Organization[];
  isActiveColumn: boolean;
  probability: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnTotal = deals.reduce((sum, d) => sum + d.value, 0);
  const columnWeighted = deals.reduce(
    (sum, d) => sum + d.value * (probability / 100),
    0
  );

  return (
    <div className="flex w-[272px] shrink-0 flex-col rounded-lg bg-muted/60 dark:bg-muted/30">
      {/* Column header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={cn("h-2 w-2 shrink-0 rounded-full", getStageStyle(title).dot)}
            aria-hidden
          />
          <h3 className="truncate text-[13px] font-medium">{title}</h3>
          <span className="text-xs tabular-nums text-muted-foreground">
            {deals.length}
          </span>
        </div>
        <span
          className="text-xs tabular-nums text-muted-foreground"
          title="Win probability for this stage"
        >
          {probability}%
        </span>
      </div>

      {/* Card list */}
      <div
        ref={setNodeRef}
        role="region"
        aria-label={`${title} deals`}
        className={`flex-1 space-y-2 px-2 pb-2 min-h-[200px] rounded-lg transition-colors ${
          isOver
            ? "bg-blue-50/60 dark:bg-blue-500/10 ring-2 ring-blue-500/50"
            : ""
        } ${
          isActiveColumn
            ? "ring-1 ring-inset ring-border"
            : ""
        }`}
      >
        {deals.map((deal) => (
          <DraggableCard
            key={deal.id}
            deal={deal}
            organization={organizations.find(
              (o) => o.id === deal.organizationId
            )}
          />
        ))}
      </div>

      {/* Column footer - sticky at bottom */}
      <div className="border-t border-border/70 px-3 py-2">
        <div className="text-xs text-muted-foreground space-y-0.5 tabular-nums">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-medium text-foreground">{formatDealValue(columnTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Weighted</span>
            <span className="font-medium">{formatDealValue(columnWeighted)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PipelineClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  useCreateIntent("deal", () => setIsModalOpen(true));
  const [filters, setFilters] = useState<FilterValues>({});
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setOrganizations(getOrganizations());
    setDeals(getDeals());
  }, []);

  const orgMap = useMemo(() => {
    const map: Record<string, Organization> = {};
    organizations.forEach((org) => {
      map[org.id] = org;
    });
    return map;
  }, [organizations]);

  const facets: FilterFacet[] = useMemo(
    () => [
      { key: "stage", label: "Stage", options: pipelineStages.map((s) => s.name).filter((name) => deals.some((d) => d.stage === name)) },
      { key: "owner", label: "Owner", options: facetOptions(deals.map((d) => d.owner)) },
      { key: "industry", label: "Industry", options: facetOptions(deals.map((d) => orgMap[d.organizationId]?.industry)) },
      { key: "location", label: "Location", options: facetOptions(deals.map((d) => orgMap[d.organizationId]?.location)) },
    ],
    [deals, orgMap]
  );

  const filteredDeals = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = (key: string, value: string | undefined) =>
      !filters[key]?.length || (!!value && filters[key].includes(value));
    return deals.filter((deal) => {
      const org = orgMap[deal.organizationId];
      if (!org) return false;
      const matchesSearch =
        !term ||
        deal.title.toLowerCase().includes(term) ||
        org.name.toLowerCase().includes(term);
      return (
        matchesSearch &&
        matches("stage", deal.stage) &&
        matches("owner", deal.owner) &&
        matches("industry", org.industry) &&
        matches("location", org.location)
      );
    });
  }, [deals, searchTerm, filters, orgMap]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;

    const stageObj = pipelineStages.find((s) => s.id === newStageId);
    if (!stageObj) return;

    const moved = deals.find((d) => d.id === dealId);
    if (!moved || moved.stage === stageObj.name) return;

    const updatedDeals = deals.map((d) =>
      d.id === dealId ? withStage(d, stageObj.name) : d
    );

    setDeals(updatedDeals);
    saveDeals(updatedDeals);
    toast.success(`Moved “${moved.title}” to ${stageObj.name}`);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleAddDeal = (dealData: Omit<Deal, "id" | "createdAt">) => {
    const newDeal = addDeal(dealData);
    setDeals((prev) => [...prev, newDeal]);
    setIsModalOpen(false);
  };

  const activeDeal = activeId
    ? deals.find((d) => d.id === activeId)
    : null;

  // The header summarises open pipeline: won and lost deals have their own
  // columns but aren't "in the pipeline" any more.
  const openDeals = filteredDeals.filter((d) => !CLOSED_STAGES.has(d.stage));
  const totalPipelineValue = openDeals
    // DEMO BUG: pipeline-total-mismatch
    .filter((d) => !(isDemoBugEnabled("pipeline-total-mismatch") && d.stage === "New"))
    .reduce((sum, d) => sum + d.value, 0);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main className="w-full px-8 py-6">
        <PipelineHeader
          openModal={() => setIsModalOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          facets={facets}
          filters={filters}
          onFiltersChange={setFilters}
          totalValue={totalPipelineValue}
          dealCount={openDeals.length}
        />
        <div className="mt-5">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-start gap-3 min-w-max">
              {pipelineStages.map((stage) => {
                const stageDeals = filteredDeals.filter(
                  (d) =>
                    d.stage.toLowerCase().replace(/ /g, "-") === stage.id
                );
                return (
                  <DroppableColumn
                    key={stage.id}
                    id={stage.id}
                    title={stage.name}
                    deals={stageDeals}
                    organizations={organizations}
                    isActiveColumn={activeId !== null}
                    probability={STAGE_PROBABILITIES[stage.name] ?? 0}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </main>
      <DragOverlay>
        {activeDeal ? (
          <div className="opacity-80 rotate-3 scale-105">
            <DealCard
              deal={activeDeal}
              organization={orgMap[activeDeal.organizationId]}
            />
          </div>
        ) : null}
      </DragOverlay>
      <AddDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDeal}
      />
    </DndContext>
  );
}
