"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { DealCard } from "@/components/deal-card";
import { PipelineHeader } from "@/components/pipeline-header";
import { PipelineListView } from "@/components/pipeline-list-view";
import { AddDealModal } from "@/components/add-deal-modal";
import type { Organization, DealStage } from "@/types/organization";
import type { Deal } from "@/types/deal";
import { getOrganizations } from "@/lib/organizationData";
import { getDeals, saveDeals, addDeal, formatDealValue, STAGE_PROBABILITIES } from "@/lib/dealData";
import { PIPELINE_STAGES } from "@/lib/pipelineConfig";
import { usePipelineViewPrefs } from "@/lib/usePipelineViewPrefs";
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

function DraggableCard({
  deal,
  organization,
  density,
}: {
  deal: Deal;
  organization?: Organization;
  density?: "comfortable" | "compact";
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
      <DealCard deal={deal} organization={organization} density={density} />
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
  density,
}: {
  id: string;
  title: string;
  deals: Deal[];
  organizations: Organization[];
  isActiveColumn: boolean;
  probability: number;
  density?: "comfortable" | "compact";
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
    <div className="flex flex-col min-w-[280px] max-w-[320px]">
      {/* Column header */}
      <div className="bg-gray-100 dark:bg-gray-800/50 px-4 py-3 rounded-md mb-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">
            <span className="text-muted-foreground">({probability}%)</span>{" "}
            {title}
          </h3>
          <span className="text-xs text-muted-foreground bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
      </div>

      {/* Card list */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 px-1 min-h-[200px] rounded-lg transition-colors ${
          isOver
            ? "bg-orange-50 dark:bg-orange-900/10 ring-2 ring-orange-500"
            : ""
        } ${
          isActiveColumn
            ? "ring-1 ring-dashed ring-gray-300 dark:ring-gray-700"
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
            density={density}
          />
        ))}
      </div>

      {/* Column footer */}
      <div className="border-t border-gray-200 dark:border-gray-700 mt-4 pt-3 px-2">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Total</span>
            <span className="font-medium">{formatDealValue(columnTotal)}</span>
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

function sortDeals(deals: Deal[], sortBy: string): Deal[] {
  if (sortBy === "default") return deals;
  return [...deals].sort((a, b) => {
    switch (sortBy) {
      case "value-desc":
        return b.value - a.value;
      case "close-date-asc":
        return (
          new Date(a.expectedCloseDate).getTime() -
          new Date(b.expectedCloseDate).getTime()
        );
      case "activity-desc": {
        const aDate = a.lastActivityDate ? new Date(a.lastActivityDate).getTime() : 0;
        const bDate = b.lastActivityDate ? new Date(b.lastActivityDate).getTime() : 0;
        return bDate - aDate;
      }
      case "created-desc":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });
}

export function PipelineClient() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: [] as string[],
    dealStage: [] as string[],
    industry: [] as string[],
  });
  const [activeId, setActiveId] = useState<string | null>(null);

  const [prefs, setPrefs, resetPrefs] = usePipelineViewPrefs();

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

  const filteredDeals = useMemo(() => {
    const filtered = deals.filter((deal) => {
      const org = orgMap[deal.organizationId];
      if (!org) return false;

      const matchesSearch =
        deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation =
        filters.location.length === 0 ||
        filters.location.includes(org.location);
      const matchesStage =
        filters.dealStage.length === 0 ||
        filters.dealStage.includes(deal.stage);
      const matchesIndustry =
        filters.industry.length === 0 ||
        filters.industry.includes(org.industry);
      return matchesSearch && matchesLocation && matchesStage && matchesIndustry;
    });
    return sortDeals(filtered, prefs.sortBy);
  }, [deals, searchTerm, filters, orgMap, prefs.sortBy]);

  const visibleStages = useMemo(
    () => PIPELINE_STAGES.filter((s) => prefs.visibleStages.includes(s.name)),
    [prefs.visibleStages]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStageId = over.id as string;

    const stageObj = PIPELINE_STAGES.find((s) => s.id === newStageId);
    if (!stageObj) return;

    const updatedDeals = deals.map((d) => {
      if (d.id === dealId) {
        const probability = STAGE_PROBABILITIES[stageObj.name] ?? d.probability;
        return { ...d, stage: stageObj.name, probability };
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

  const activeDeal = activeId
    ? deals.find((d) => d.id === activeId)
    : null;

  const totalPipelineValue = filteredDeals.reduce(
    (sum, d) => sum + d.value,
    0
  );

  return (
    <>
      <main className="container py-8 max-w-[1400px] mx-auto px-6">
        <PipelineHeader
          openModal={() => setIsModalOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          setFilters={setFilters}
          totalValue={totalPipelineValue}
          dealCount={filteredDeals.length}
          prefs={prefs}
          setPrefs={setPrefs}
          resetPrefs={resetPrefs}
        />

        <div className="mt-10">
          {prefs.view === "list" ? (
            <PipelineListView
              deals={filteredDeals}
              organizations={organizations}
              visibleStages={prefs.visibleStages as DealStage[]}
            />
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-6 min-w-max">
                  {visibleStages.map((stage) => {
                    const stageDeals = filteredDeals.filter(
                      (d) => d.stage === stage.name
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
                        density={prefs.density}
                      />
                    );
                  })}
                </div>
              </div>
              <DragOverlay>
                {activeDeal ? (
                  <div className="opacity-80 rotate-3 scale-105">
                    <DealCard
                      deal={activeDeal}
                      organization={orgMap[activeDeal.organizationId]}
                      density={prefs.density}
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </main>

      <AddDealModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDeal}
      />
    </>
  );
}
