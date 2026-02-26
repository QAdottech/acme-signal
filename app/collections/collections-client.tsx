"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collection, Organization } from "@/types/organization";
import {
  getCollections,
  getOrganizations,
  saveCollections,
  deduplicateCollectionOrganizationIds,
} from "@/lib/organizationData";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus, Edit } from "lucide-react";
import { AddCollectionModal } from "@/components/add-collection-modal";
import { EditCollectionModal } from "@/components/edit-collection-modal";

export function CollectionsClient() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(
    null
  );

  useEffect(() => {
    // Clean up any existing duplicates
    deduplicateCollectionOrganizationIds();
    setCollections(getCollections() || []);
    setOrganizations(getOrganizations() || []);
  }, []);

  const handleAddCollection = (
    newCollection: Omit<Collection, "id" | "organizationIds">
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const collectionWithId = { ...newCollection, id, organizationIds: [] };
    const updatedCollections = [...collections, collectionWithId];
    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    setIsAddModalOpen(false);
  };

  const handleEditCollection = (editedCollection: Collection) => {
    const updatedCollections = collections.map((collection) =>
      collection.id === editedCollection.id ? editedCollection : collection
    );
    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    setIsEditModalOpen(false);
    setEditingCollection(null);
  };

  const handleDeleteCollection = (collectionId: string) => {
    const updatedCollections = collections.filter(
      (collection) => collection.id !== collectionId
    );
    setCollections(updatedCollections);
    saveCollections(updatedCollections);
    setIsEditModalOpen(false);
    setEditingCollection(null);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setIsEditModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 container py-16 max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Collections</h1>
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Collection
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const orgCount = collection.organizationIds?.length || 0;
            const tagCount = collection.tags?.length || 0;
            const geos = new Set(
              collection.organizationIds
                ?.map((id) => organizations.find((o) => o.id === id)?.location)
                .filter(Boolean)
            );
            const geoCount = geos.size;
            return (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 cursor-pointer">
                  {/* Purple header */}
                  <div className="relative bg-[#2D1A45] p-6 pb-8 h-48">
                    <div className="relative flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl font-bold mb-2 text-white">
                          {collection.name}
                        </CardTitle>
                        <p className="text-sm text-white/80 leading-relaxed line-clamp-2">
                          {collection.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openEditModal(collection);
                        }}
                        className="shrink-0 text-white hover:bg-white/20 transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Stats bar */}
                    <div className="relative mt-4 flex gap-3">
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-sm font-bold">{orgCount}</span>
                        </div>
                        <span className="text-xs font-medium">companies</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-sm font-bold">{geoCount}</span>
                        </div>
                        <span className="text-xs font-medium">geos</span>
                      </div>
                      <div className="flex items-center gap-2 text-white/90">
                        <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-sm font-bold">{tagCount}</span>
                        </div>
                        <span className="text-xs font-medium">tags</span>
                      </div>
                    </div>
                  </div>

                  <CardContent className="relative pt-6 pb-6 bg-white dark:bg-gray-950">
                    {/* Tags */}
                    {collection.tags && collection.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {collection.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Organizations */}
                    <div className="flex flex-wrap gap-2">
                      {collection.organizationIds &&
                        collection.organizationIds.map((orgId) => {
                          const org = organizations.find((o) => o.id === orgId);
                          return org ? (
                            <div key={orgId} className="group/logo relative">
                              <Link
                                href={`/organizations/${orgId}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="block w-10 h-10 relative rounded-full overflow-hidden transition-all duration-200 ease-in-out transform hover:scale-110 border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-[#2D1A45] hover:shadow-lg"
                              >
                                <Image
                                  src={org.logo || "/placeholder.svg"}
                                  alt={`${org.name} logo`}
                                  layout="fill"
                                  objectFit="cover"
                                />
                              </Link>
                              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded opacity-0 group-hover/logo:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50 shadow-lg">
                                {org.name}
                              </div>
                            </div>
                          ) : null;
                        })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
        <AddCollectionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddCollection}
        />
        {editingCollection && (
          <EditCollectionModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingCollection(null);
            }}
            onEdit={handleEditCollection}
            onDelete={handleDeleteCollection}
            collection={editingCollection}
            organizations={organizations}
          />
        )}
      </main>
    </div>
  );
}
