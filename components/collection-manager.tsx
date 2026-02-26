import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Organization, Collection } from "@/types/organization";
import {
  getCollections,
  saveCollections,
  getOrganizations,
  saveOrganizations,
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

  // Always get fresh data from localStorage
  const allCollections = getCollections();
  const memberCollections = allCollections.filter((collection) =>
    organization.collections?.includes(collection.id)
  );
  const availableCollections = allCollections.filter(
    (collection) => !organization.collections?.includes(collection.id)
  );

  const handleRemoveFromCollection = (collectionId: string) => {
    // Get fresh data
    const organizations = getOrganizations();
    const collections = getCollections();

    // Calculate new collection list for this organization
    const newCollectionIds = (organization.collections ?? []).filter(
      (id) => id !== collectionId
    );

    // Update organization
    const updatedOrganizations = organizations.map((org) =>
      org.id === organization.id
        ? { ...org, collections: newCollectionIds }
        : org
    );

    // Update all collections - remove this org from the collection we're leaving
    const updatedCollections = collections.map((collection) => ({
      ...collection,
      organizationIds: newCollectionIds.includes(collection.id)
        ? [...new Set([...collection.organizationIds, organization.id])]
        : collection.organizationIds.filter((id) => id !== organization.id),
    }));

    // Save to localStorage
    saveOrganizations(updatedOrganizations);
    saveCollections(updatedCollections);

    // Notify parent
    onCollectionsChange(newCollectionIds);
  };

  const handleAddToCollection = (collectionId: string) => {
    // Get fresh data
    const organizations = getOrganizations();
    const collections = getCollections();

    // Calculate new collection list for this organization
    const newCollectionIds = [
      ...(organization.collections ?? []),
      collectionId,
    ];

    // Update organization
    const updatedOrganizations = organizations.map((org) =>
      org.id === organization.id
        ? { ...org, collections: newCollectionIds }
        : org
    );

    // Update all collections - add this org to collections it's a member of
    const updatedCollections = collections.map((collection) => ({
      ...collection,
      organizationIds: newCollectionIds.includes(collection.id)
        ? [...new Set([...collection.organizationIds, organization.id])]
        : collection.organizationIds.filter((id) => id !== organization.id),
    }));

    // Save to localStorage
    saveOrganizations(updatedOrganizations);
    saveCollections(updatedCollections);

    // Notify parent and close popover
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
