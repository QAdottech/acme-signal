"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { DealCard } from "@/components/deal-card";
import { PipelineHeader } from "@/components/pipeline-header";
import { AddDealModal } from "@/components/add-deal-modal";
import type { Organization, DealStage } from "@/types/organization";
import type { Deal } from "@/types/deal";
import { getOrganizations } from "@/lib/organizationData";
import { getDeals, saveDeals, addDeal, formatDealValue } from "@/lib/dealData";
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

const pipelineStages = [
  { id: "lead", name: "Lead" as DealStage },
  { id: "qualified", name: "Qualified" as DealStage },
  { id: "proposal", name: "Proposal" as DealStage },
  { id: "negotiation", name: "Negotiation" as DealStage },
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
}: {
  id: string;
  title: string;
  deals: Deal[];
  organizations: Organization[];
  isActiveColumn: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const columnValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800/50 px-4 py-3 rounded-md">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">{title}</h3>
          <span className="text-sm text-muted-foreground bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDealValue(columnValue)}
        </p>
      </div>
      <div
        ref={setNodeRef}
        className={`space-y-3 px-1 min-h-[200px] rounded-lg transition-colors ${
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
          />
        ))}
      </div>
    </div>
  );
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
    return deals.filter((deal) => {
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
  }, [deals, searchTerm, filters, orgMap]);

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

    const stageObj = pipelineStages.find((s) => s.id === newStageId);
    if (!stageObj) return;

    const updatedDeals = deals.map((d) => {
      if (d.id === dealId) {
        return { ...d, stage: stageObj.name };
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
    setDeals([...deals, newDeal]);
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
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <main className="container py-8 max-w-[1400px] mx-auto px-6">
        <PipelineHeader
          openModal={() => setIsModalOpen(true)}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          filters={filters}
          setFilters={setFilters}
          totalValue={totalPipelineValue}
          dealCount={filteredDeals.length}
        />
        <div className="mt-10">
          <div className="grid grid-cols-4 gap-8">
            {pipelineStages.map((stage) => (
              <DroppableColumn
                key={stage.id}
                id={stage.id}
                title={stage.name}
                deals={filteredDeals.filter(
                  (d) =>
                    d.stage.toLowerCase().replace(/ /g, "-") === stage.id
                )}
                organizations={organizations}
                isActiveColumn={activeId !== null}
              />
            ))}
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
