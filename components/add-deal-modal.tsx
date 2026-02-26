"use client";

import type React from "react";
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
import type { Deal } from "@/types/deal";
import type { Organization, DealStage } from "@/types/organization";
import { getOrganizations } from "@/lib/organizationData";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (deal: Omit<Deal, "id" | "createdAt">) => void;
  defaultStage?: DealStage;
}

const dealStages: DealStage[] = [
  "New",
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
];

const owners = [
  "Sarah Johnson",
  "Michael Chen",
  "Emma Wilson",
  "David Martinez",
];

const AVAILABLE_TAGS = [
  "Pre POC",
  "POC",
  "POC Complete",
  "Enterprise",
  "Startup",
  "Expansion",
  "Renewal",
  "At Risk",
  "Champion Identified",
  "Technical Eval",
];

export function AddDealModal({
  isOpen,
  onClose,
  onAdd,
  defaultStage = "Lead",
}: AddDealModalProps) {
  const [title, setTitle] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<DealStage>(defaultStage);
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [owner, setOwner] = useState("");
  const [probability, setProbability] = useState("20");
  const [nextStep, setNextStep] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagsOpen, setTagsOpen] = useState(false);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [orgOpen, setOrgOpen] = useState(false);
  const [stageOpen, setStageOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOrganizations(getOrganizations());
      setStage(defaultStage);
    }
  }, [isOpen, defaultStage]);

  const selectedOrg = organizations.find((o) => o.id === organizationId);

  const handleAddTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
    setTagsOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      title,
      organizationId,
      value: Number(value),
      currency: "USD",
      stage,
      expectedCloseDate,
      owner,
      probability: Number(probability),
      nextStep: nextStep || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    });
    setTitle("");
    setOrganizationId("");
    setValue("");
    setStage(defaultStage);
    setExpectedCloseDate("");
    setOwner("");
    setProbability("20");
    setNextStep("");
    setSelectedTags([]);
    setTagsInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Deal</DialogTitle>
          <DialogDescription>
            Add a new deal to your pipeline.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deal-title" className="text-right">
                Title
              </Label>
              <Input
                id="deal-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Enterprise License"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Company</Label>
              <Popover open={orgOpen} onOpenChange={setOrgOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="col-span-3 justify-between"
                  >
                    {selectedOrg?.name || "Select company..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0">
                  <Command>
                    <CommandInput placeholder="Search companies..." />
                    <CommandEmpty>No company found.</CommandEmpty>
                    <CommandGroup className="max-h-[200px] overflow-auto">
                      {organizations.map((org) => (
                        <CommandItem
                          key={org.id}
                          onSelect={() => {
                            setOrganizationId(org.id);
                            setOrgOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organizationId === org.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {org.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deal-value" className="text-right">
                Value ($)
              </Label>
              <Input
                id="deal-value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="50000"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Stage</Label>
              <Popover open={stageOpen} onOpenChange={setStageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="col-span-3 justify-between"
                  >
                    {stage}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search stage..." />
                    <CommandEmpty>No stage found.</CommandEmpty>
                    <CommandGroup>
                      {dealStages.map((s) => (
                        <CommandItem
                          key={s}
                          onSelect={() => {
                            setStage(s);
                            setStageOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              stage === s ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {s}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deal-close" className="text-right">
                Close Date
              </Label>
              <Input
                id="deal-close"
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Owner</Label>
              <Popover open={ownerOpen} onOpenChange={setOwnerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="col-span-3 justify-between"
                  >
                    {owner || "Select owner..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandEmpty>No owner found.</CommandEmpty>
                    <CommandGroup>
                      {owners.map((o) => (
                        <CommandItem
                          key={o}
                          onSelect={() => {
                            setOwner(o);
                            setOwnerOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              owner === o ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {o}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deal-probability" className="text-right">
                Probability %
              </Label>
              <Input
                id="deal-probability"
                type="number"
                min="0"
                max="100"
                value={probability}
                onChange={(e) => setProbability(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="deal-next-step" className="text-right">
                Next Step
              </Label>
              <Input
                id="deal-next-step"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Schedule demo with CTO"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Tags</Label>
              <div className="col-span-3 space-y-2">
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-orange-900 dark:hover:text-orange-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <Popover open={tagsOpen} onOpenChange={setTagsOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between text-sm"
                      type="button"
                    >
                      Add tag...
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[250px] p-0">
                    <Command>
                      <CommandInput placeholder="Search tags..." />
                      <CommandEmpty>No tag found.</CommandEmpty>
                      <CommandGroup className="max-h-[200px] overflow-auto">
                        {AVAILABLE_TAGS.filter(
                          (t) => !selectedTags.includes(t)
                        ).map((tag) => (
                          <CommandItem
                            key={tag}
                            onSelect={() => handleAddTag(tag)}
                          >
                            {tag}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Create Deal
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
