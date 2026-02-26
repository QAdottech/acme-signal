"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Collection, Organization } from "@/types/organization";
import { X } from "lucide-react";
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

interface EditCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (collection: Collection) => void;
  onDelete: (collectionId: string) => void;
  collection: Collection;
  organizations: Organization[];
}

export function EditCollectionModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  collection,
  organizations,
}: EditCollectionModalProps) {
  const [name, setName] = useState(collection.name);
  const [description, setDescription] = useState(collection.description);
  const [tags, setTags] = useState<string[]>(collection.tags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [organizationIds, setOrganizationIds] = useState<string[]>(
    collection.organizationIds
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setName(collection.name);
    setDescription(collection.description);
    setTags(collection.tags || []);
    setOrganizationIds(collection.organizationIds);
  }, [collection]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEdit({
      ...collection,
      name,
      description,
      tags,
      organizationIds,
    });
  };

  const handleAddTag = () => {
    if (currentTag.trim() !== "" && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleAddOrganization = (orgId: string) => {
    if (!organizationIds.includes(orgId)) {
      setOrganizationIds([...organizationIds, orgId]);
    }
    setOpen(false);
  };

  const handleRemoveOrganization = (orgId: string) => {
    setOrganizationIds(organizationIds.filter((id) => id !== orgId));
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      onDelete(collection.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Collection</DialogTitle>
          <DialogDescription>
            Make changes to your collection here.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex space-x-2">
                  <Input
                    id="tags"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag"
                    className="focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                  />
                  <Button type="button" onClick={handleAddTag}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Organizations</Label>
              <div className="col-span-3 space-y-2">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      Add organization
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[200px] p-0">
                    <Command>
                      <CommandInput placeholder="Search organization..." />
                      <CommandEmpty>No organization found.</CommandEmpty>
                      <CommandGroup>
                        {organizations
                          .filter((org) => !organizationIds.includes(org.id))
                          .map((org) => (
                            <CommandItem
                              key={org.id}
                              onSelect={() => handleAddOrganization(org.id)}
                            >
                              {org.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="space-y-2">
                  {organizationIds.map((orgId) => {
                    const org = organizations.find((o) => o.id === orgId);
                    return org ? (
                      <div
                        key={orgId}
                        className="flex items-center justify-between bg-gray-100 p-2 rounded-md"
                      >
                        <span>{org.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOrganization(orgId)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete Collection
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
