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
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Person } from "@/types/person";

interface EditPersonModalProps {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
  onSave: (person: Person) => void;
}

export function EditPersonModal({
  isOpen,
  person,
  onClose,
  onSave,
}: EditPersonModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "",
    organization: "",
    phone: "",
    linkedIn: "",
    notes: "",
    status: "Active" as "Active" | "Inactive",
    lastContact: "",
  });
  const [statusOpen, setStatusOpen] = useState(false);

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name,
        email: person.email,
        role: person.role,
        organization: person.organization,
        phone: person.phone || "",
        linkedIn: person.linkedIn || "",
        notes: person.notes || "",
        status: person.status,
        lastContact: person.lastContact || "",
      });
    }
  }, [person]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!person) return;
    onSave({ ...formData, id: person.id, avatar: person.avatar });
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Person</DialogTitle>
          <DialogDescription>
            Update the details for this person.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-role" className="text-right">
                Role
              </Label>
              <Input
                id="edit-role"
                value={formData.role}
                onChange={(e) => handleChange("role", e.target.value)}
                placeholder="e.g., CEO, VP of Product"
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-organization" className="text-right">
                Organization
              </Label>
              <Input
                id="edit-organization"
                value={formData.organization}
                onChange={(e) => handleChange("organization", e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-linkedIn" className="text-right">
                LinkedIn
              </Label>
              <Input
                id="edit-linkedIn"
                value={formData.linkedIn}
                onChange={(e) => handleChange("linkedIn", e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={statusOpen}
                    className="w-[200px] col-span-3 justify-between"
                  >
                    {formData.status || "Select status"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search status..." />
                    <CommandEmpty>No status found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          handleChange("status", "Active");
                          setStatusOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.status === "Active"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Active
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          handleChange("status", "Inactive");
                          setStatusOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.status === "Inactive"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Inactive
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-lastContact" className="text-right">
                Last Contact
              </Label>
              <Input
                id="edit-lastContact"
                type="date"
                value={formData.lastContact}
                onChange={(e) => handleChange("lastContact", e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes about this person..."
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
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
