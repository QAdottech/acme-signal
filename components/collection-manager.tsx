"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Organization, Collection } from "@/types/organization";
import {
  getCollections,
  setOrganizationCollections,
} from "@/lib/organizationData";
import { X, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CollectionManagerProps {
  organization: Organization;
  onCollectionsChange: (updatedCollections: string[]) => void;
}

export function CollectionManager({
  organization,
  onCollectionsChange,
}: CollectionManagerProps) {
  const [open, setOpen] = useState(false);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);

  useEffect(() => {
    getCollections().then(setAllCollections);
  }, [organization.collections]);

  const memberCollections = allCollections.filter((collection) =>
    organization.collections?.includes(collection.id)
  );
  const availableCollections = allCollections.filter(
    (collection) => !organization.collections?.includes(collection.id)
  );

  const handleRemoveFromCollection = async (collectionId: string) => {
    const newCollectionIds = (organization.collections ?? []).filter(
      (id) => id !== collectionId
    );
    await setOrganizationCollections(organization.id, newCollectionIds);
    window.dispatchEvent(new Event("collections-updated"));
    onCollectionsChange(newCollectionIds);
  };

  const handleAddToCollection = async (collectionId: string) => {
    const newCollectionIds = [
      ...(organization.collections ?? []),
      collectionId,
    ];
    await setOrganizationCollections(organization.id, newCollectionIds);
    window.dispatchEvent(new Event("collections-updated"));
    onCollectionsChange(newCollectionIds);
    setOpen(false);
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-base">Collections</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {memberCollections.map((collection) => (
            <div
              key={collection.id}
              className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 text-m p-2 rounded-md"
            >
              <span>{collection.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveFromCollection(collection.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between mt-4"
            >
              Add to collection
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput placeholder="Search collections..." />
              <CommandEmpty>No collections found.</CommandEmpty>
              <CommandGroup>
                {availableCollections.map((collection) => (
                  <CommandItem
                    key={collection.id}
                    onSelect={() => handleAddToCollection(collection.id)}
                  >
                    {collection.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </CardContent>
    </Card>
  );
}
