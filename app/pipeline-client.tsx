"use client";

import { useState, useEffect, useMemo, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DealCard } from "@/components/deal-card";
import { PipelineHeader } from "@/components/pipeline-header";
import { PipelineTable } from "@/components/pipeline-table";
import { PipelineForecast } from "@/components/pipeline-forecast";
import { AddDealModal } from "@/components/add-deal-modal";
import type { Organization } from "@/types/organization";
import type { Deal } from "@/types/deal";
import { getCollections, getOrganizations } from "@/lib/organizationData";
import {
  getDeals,
  saveDeals,
  addDeal,
  formatCompactValue,
  STAGE_PROBABILITIES,
} from "@/lib/dealData";
import {
  applyPipelineView,
  buildWeightedSparkline,
  columnIdForStage,
  isOpenDeal,
  PIPELINE_COLUMNS,
  QUARTERLY_QUOTA,
} from "@/lib/pipeline";
import { useAuth } from "@/lib/auth-context";
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

type PipelineTab = "board" | "table" | "forecast";

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
  const ignoreClick = useRef(false);

  if (isDragging) {
    ignoreClick.current = true;
  }

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.35 : 1,
    touchAction: "none" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab active:cursor-grabbing"
      onClickCapture={(event) => {
        if (ignoreClick.current || isDragging) {
          event.preventDefault();
          event.stopPropagation();
          ignoreClick.current = false;
        }
      }}
    >
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
  activeDeal,
  probability,
}: {
  id: string;
  title: string;
  deals: Deal[];
  organizations: Organization[];
  isActiveColumn: boolean;
  activeDeal: Deal | null;
  probability: number;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnTotal = deals.reduce((sum, d) => sum + d.value, 0);
  const weightedDelta = activeDeal
    ? activeDeal.value * (probability / 100) -
      activeDeal.value * ((activeDeal.probability || 0) / 100)
    : 0;
  const showDropHint =
    isOver && activeDeal && columnIdForStage(activeDeal.stage) !== id;

  return (
    <div className="flex flex-col min-w-[220px] w-[240px] flex-1 max-w-[280px] min-h-0 h-full">
      <div className="flex items-baseline justify-between mb-3 px-0.5 shrink-0">
        <div className="flex items-baseline gap-1.5">
          <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
          <span className="text-sm text-neutral-400">{deals.length}</span>
        </div>
        <span className="text-sm text-neutral-400 tabular-nums">
          {formatCompactValue(columnTotal)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 space-y-2.5 min-h-0 overflow-y-auto rounded-xl pb-4 transition-colors ${
          isOver ? "bg-blue-50/60" : ""
        } ${isActiveColumn && !isOver ? "bg-neutral-50/80" : ""}`}
      >
        {deals.map((deal) => (
          <DraggableCard
            key={deal.id}
            deal={deal}
            organization={organizations.find((o) => o.id === deal.organizationId)}
          />
        ))}
        {showDropHint && (
          <div className="rounded-xl border border-dashed border-blue-400 bg-blue-50/40 px-3 py-4 text-center text-xs font-medium text-blue-600">
            Move to {title}
            {weightedDelta !== 0 && (
              <>
                {" · "}
                {weightedDelta > 0 ? "+" : ""}
                {formatCompactValue(weightedDelta)} weighted
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PipelineBoard() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tab, setTab] = useState<PipelineTab>("board");
  const [filters, setFilters] = useState({
    location: [] as string[],
    dealStage: [] as string[],
    industry: [] as string[],
  });
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [ownerMe, setOwnerMe] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const view = searchParams?.get("view");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
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

  const owners = useMemo(() => {
    return Array.from(new Set(deals.map((d) => d.owner).filter(Boolean))).sort();
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const collections = getCollections();
    const viewed = applyPipelineView(deals, view, orgMap, collections);

    return viewed.filter((deal) => {
      if (!isOpenDeal(deal)) return false;
      const org = orgMap[deal.organizationId];
      if (!org) return false;

      const matchesLocation =
        filters.location.length === 0 ||
        filters.location.includes(org.location);
      const matchesStage =
        filters.dealStage.length === 0 ||
        filters.dealStage.includes(deal.stage);
      const matchesIndustry =
        filters.industry.length === 0 ||
        filters.industry.includes(org.industry);

      const ownerNames = [
        ...selectedOwners,
        ...(ownerMe && user?.fullName ? [user.fullName] : []),
      ];
      const matchesOwner =
        ownerNames.length === 0 || ownerNames.includes(deal.owner);

      return matchesLocation && matchesStage && matchesIndustry && matchesOwner;
    });
  }, [
    deals,
    filters,
    orgMap,
    view,
    selectedOwners,
    ownerMe,
    user?.fullName,
  ]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;

    const stageObj = PIPELINE_COLUMNS.find((s) => s.id === newStageId);
    if (!stageObj) return;

    const updatedDeals = deals.map((d) => {
      if (d.id === dealId) {
        const probability = STAGE_PROBABILITIES[stageObj.stage] ?? d.probability;
        return { ...d, stage: stageObj.stage, probability };
      }
      return d;
    });

    setDeals(updatedDeals);
    saveDeals(updatedDeals);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const handleAddDeal = (dealData: Omit<Deal, "id" | "createdAt">) => {
    const newDeal = addDeal(dealData);
    setDeals((prev) => [...prev, newDeal]);
    setIsModalOpen(false);
  };

  const activeDeal = activeId ? deals.find((d) => d.id === activeId) : null;

  const totalPipelineValue = filteredDeals.reduce((sum, d) => sum + d.value, 0);
  const weightedValue = filteredDeals.reduce(
    (sum, d) => sum + d.value * ((d.probability || 0) / 100),
    0
  );
  const coverage = totalPipelineValue / QUARTERLY_QUOTA;
  const sparkline = buildWeightedSparkline(weightedValue);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="h-full min-h-0 flex flex-col">
        <div className="px-8 pt-6 pb-4 shrink-0">
          <PipelineHeader
            openModal={() => setIsModalOpen(true)}
            filters={filters}
            setFilters={setFilters}
            owners={owners}
            selectedOwners={selectedOwners}
            setSelectedOwners={setSelectedOwners}
            ownerMe={ownerMe}
            setOwnerMe={setOwnerMe}
            currentUserName={user?.fullName}
            totalValue={totalPipelineValue}
            weightedValue={weightedValue}
            dealCount={filteredDeals.length}
            coverage={coverage}
            sparkline={sparkline.values}
            sparklineChange={sparkline.changePct}
            tab={tab}
            onTabChange={setTab}
          />
        </div>

        <div className="flex-1 min-h-0 px-8 pb-6">
          {tab === "board" && (
            <div className="h-full overflow-x-auto overflow-y-hidden">
              <div className="flex gap-5 min-w-max h-full">
                {PIPELINE_COLUMNS.map((stage) => {
                  const stageDeals = filteredDeals.filter(
                    (d) => columnIdForStage(d.stage) === stage.id
                  );
                  return (
                    <DroppableColumn
                      key={stage.id}
                      id={stage.id}
                      title={stage.title}
                      deals={stageDeals}
                      organizations={organizations}
                      isActiveColumn={activeId !== null}
                      activeDeal={activeDeal ?? null}
                      probability={STAGE_PROBABILITIES[stage.stage] ?? 0}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {tab === "table" && (
            <div className="overflow-auto h-full pr-1">
              <PipelineTable deals={filteredDeals} organizations={orgMap} />
            </div>
          )}
          {tab === "forecast" && (
            <div className="overflow-auto h-full max-w-3xl pr-1">
              <PipelineForecast deals={filteredDeals} />
            </div>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeDeal ? (
          <div className="opacity-90 rotate-2 scale-[1.02] w-[240px]">
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

export function PipelineClient() {
  return (
    <div className="h-full">
      <Suspense
        fallback={
          <div className="px-8 pt-6 text-sm text-neutral-400">
            Loading pipeline...
          </div>
        }
      >
        <PipelineBoard />
      </Suspense>
    </div>
  );
}
