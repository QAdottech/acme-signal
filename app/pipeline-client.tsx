"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { DealCard } from "@/components/deal-card";
import { PipelineHeader } from "@/components/pipeline-header";
import type { Organization } from "@/types/organization";
import { getOrganizations } from "@/lib/organizationData";
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

const dealStages = [
  { id: "lead", name: "Lead", count: 0 },
  { id: "qualified", name: "Qualified", count: 0 },
  { id: "proposal", name: "Proposal", count: 0 },
  { id: "negotiation", name: "Negotiation", count: 0 },
];

function DraggableCard({ organization }: { organization: Organization }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: organization.id,
    });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <DealCard organization={organization} />
    </div>
  );
}

function DroppableColumn({
  id,
  title,
  organizations,
  isActiveColumn,
}: {
  id: string;
  title: string;
  organizations: Organization[];
  isActiveColumn: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  return (
    <div className="space-y-4">
      <div className="bg-gray-100 dark:bg-gray-800/50 px-4 py-3 rounded-md flex items-center justify-between">
        <h3 className="font-medium">{title}</h3>
        <span className="text-sm text-muted-foreground bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {organizations.length}
        </span>
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
        {organizations.map((org) => (
          <DraggableCard key={org.id} organization={org} />
        ))}
      </div>
    </div>
  );
}

export function PipelineClient() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    location: [],
    dealStage: [],
    industry: [],
  });
  const [swimlanes, setSwimlanesOption] = useState("no-swimlanes"); // Options: 'no-swimlanes', 'industry', 'location'
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
  }, []);

  const filteredOrganizations = useMemo(() => {
    return organizations.filter((org) => {
      const matchesSearch = org.name
        .toLowerCase()
        .startsWith(searchTerm.toLowerCase());
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
    });
  }, [organizations, searchTerm, filters]);

  const groupedOrganizations = useMemo(() => {
    if (swimlanes === "no-swimlanes") {
      return { All: filteredOrganizations };
    }

    return filteredOrganizations.reduce((acc, org) => {
      const key = swimlanes === "industry" ? org.industry : org.location;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(org);
      return acc;
    }, {} as Record<string, Organization[]>);
  }, [filteredOrganizations, swimlanes]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSwimlanesChange = (value: string) => {
    setSwimlanesOption(value);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const orgId = active.id as string;
    const newStatus = over.id as string;

    // Update the organization's deal stage
    const updatedOrganizations = organizations.map((org) => {
      if (org.id === orgId) {
        // Convert stage id back to proper format (e.g., "lead" -> "Lead")
        const stageObj = dealStages.find((s) => s.id === newStatus);
        if (stageObj) {
          return { ...org, dealStage: stageObj.name };
        }
      }
      return org;
    });

    setOrganizations(updatedOrganizations);
    localStorage.setItem("organizations", JSON.stringify(updatedOrganizations));
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  const activeOrganization = activeId
    ? organizations.find((org) => org.id === activeId)
    : null;

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
            onSwimlanesChange={handleSwimlanesChange}
          />
          <div className="mt-10">
            {Object.entries(groupedOrganizations).map(
              ([groupName, groupOrgs]) => (
                <div key={groupName} className="mb-8">
                  {swimlanes !== "no-swimlanes" && (
                    <h2 className="text-xl font-semibold mb-4">{groupName}</h2>
                  )}
                  <div className="grid grid-cols-4 gap-8">
                    {dealStages.map((stage) => (
                      <DroppableColumn
                        key={stage.id}
                        id={stage.id}
                        title={stage.name}
                        organizations={groupOrgs.filter(
                          (org) =>
                            org.dealStage &&
                            org.dealStage
                              .toLowerCase()
                              .replace(/ /g, "-") === stage.id
                        )}
                        isActiveColumn={activeId !== null}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        </main>
      <DragOverlay>
        {activeOrganization ? (
          <div className="opacity-80 rotate-3 scale-105">
            <DealCard organization={activeOrganization} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
