"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { addNote } from "@/lib/notesData";
import { useAuth } from "@/lib/auth-context";
import type { Organization } from "@/types/organization";

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded: () => void;
  organizations: Organization[];
}

export function AddNoteModal({
  open,
  onOpenChange,
  onNoteAdded,
  organizations,
}: AddNoteModalProps) {
  const { user } = useAuth();
  const [selectedOrgId, setSelectedOrgId] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState(user?.fullName || "");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const sortedOrgs = useMemo(
    () => [...organizations].sort((a, b) => a.name.localeCompare(b.name)),
    [organizations]
  );

  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrgId || !content.trim()) return;

    addNote({
      organizationId: selectedOrgId,
      content: content.trim(),
      authorName: authorName.trim() || "Unknown",
    });

    // Reset form
    setSelectedOrgId("");
    setContent("");
    setAuthorName(user?.fullName || "");
    onNoteAdded();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedOrgId("");
      setContent("");
      setAuthorName(user?.fullName || "");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Note</DialogTitle>
          <DialogDescription>
            Create a new note for an organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Organization selector */}
          <div className="space-y-2">
            <Label htmlFor="organization">Organization</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between font-normal"
                >
                  {selectedOrg ? selectedOrg.name : "Select organization..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[452px] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search organizations..." />
                  <CommandList>
                    <CommandEmpty>No organization found.</CommandEmpty>
                    <CommandGroup>
                      {sortedOrgs.map((org) => (
                        <CommandItem
                          key={org.id}
                          value={org.name}
                          onSelect={() => {
                            setSelectedOrgId(org.id);
                            setComboboxOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedOrgId === org.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {org.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {/* Note content */}
          <div className="space-y-2">
            <Label htmlFor="content">Note</Label>
            <Textarea
              id="content"
              placeholder="Write your note here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
              className="resize-none"
            />
          </div>

          {/* Author name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">Author</Label>
            <Input
              id="authorName"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!selectedOrgId || !content.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add Note
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
