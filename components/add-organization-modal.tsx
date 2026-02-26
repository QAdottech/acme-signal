"use client";

import type React from "react";

import { useState, type ChangeEvent } from "react";
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
import type { Organization } from "@/types/organization";
import { Upload, X } from "lucide-react";
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
import {
  convertFileToDataUrl,
  generateUniqueFileName,
  saveFileToLocalStorage,
} from "@/lib/fileUtils";

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (organization: Omit<Organization, "id">) => void;
}

export function AddOrganizationModal({
  isOpen,
  onClose,
  onAdd,
}: AddOrganizationModalProps) {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [employees, setEmployees] = useState("");
  const [logo, setLogo] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [website_url, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dealStage, setDealStage] =
    useState<Organization["dealStage"]>("New");
  const [industryOpen, setIndustryOpen] = useState(false);
  const [dealStageOpen, setDealStageOpen] = useState(false);

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const dataUrl = await convertFileToDataUrl(file);
        const fileName = generateUniqueFileName(file.name);
        const logoPath = `/logos/${fileName}`;

        // Save file to localStorage (in a real app, this would be uploaded to a server)
        saveFileToLocalStorage(logoPath, dataUrl);

        setLogo(logoPath);
        setLogoPreview(dataUrl);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const removeLogo = () => {
    setLogo("");
    setLogoPreview("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      name,
      industry,
      location,
      employees: Number.parseInt(employees, 10),
      logo,
      website_url,
      description,
      dealStage,
      collections: [],
    });
    // Reset form
    setName("");
    setIndustry("");
    setLocation("");
    setEmployees("");
    setLogo("");
    setLogoPreview("");
    setWebsiteUrl("");
    setDescription("");
    setDealStage("New");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Organization</DialogTitle>
          <DialogDescription>
            Enter the details for the new organization.
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
              <Label htmlFor="industry" className="text-right">
                Industry
              </Label>
              <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={industryOpen}
                    className="w-[200px] col-span-3 justify-between"
                  >
                    {industry || "Select industry"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search industry..." />
                    <CommandEmpty>No industry found.</CommandEmpty>
                    <CommandGroup>
                      {[
                        "Music",
                        "Food",
                        "Software testing",
                        "Web Development",
                        "HR Technology",
                        "Gaming",
                        "Fintech",
                        "Contract Management",
                        "Developer Tools",
                        "Analytics",
                        "Artificial Intelligence",
                        "E-commerce AI",
                        "EdTech",
                        "Design Tools",
                        "Biotechnology",
                        "Financial Technology",
                        "Legal Technology",
                      ].map((ind) => (
                        <CommandItem
                          key={ind}
                          onSelect={() => {
                            setIndustry(ind);
                            setIndustryOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              industry === ind ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {ind}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="location" className="text-right">
                Location
              </Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employees" className="text-right">
                Employees
              </Label>
              <Input
                id="employees"
                type="number"
                value={employees}
                onChange={(e) => setEmployees(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="logo" className="text-right">
                Logo
              </Label>
              <div className="col-span-3 space-y-2">
                {logoPreview ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img
                        src={logoPreview || "/placeholder.svg"}
                        alt="Logo preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={removeLogo}
                      className="gap-2 bg-transparent"
                    >
                      <X className="w-4 h-4" />
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("logo")?.click()}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      PNG, JPG up to 5MB
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="website_url" className="text-right">
                Website URL
              </Label>
              <Input
                id="website_url"
                type="url"
                value={website_url}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="https://example.com"
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
              <Label htmlFor="dealStage" className="text-right">
                Deal Stage
              </Label>
              <Popover open={dealStageOpen} onOpenChange={setDealStageOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={dealStageOpen}
                    className="w-[200px] col-span-3 justify-between"
                  >
                    {dealStage || "Select stage"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search stage..." />
                    <CommandEmpty>No stage found.</CommandEmpty>
                    <CommandGroup>
                      {([
                        "New",
                        "Lead",
                        "Qualified",
                        "Proposal",
                        "Negotiation",
                        "Customer",
                        "Churned",
                        "Closed Lost",
                      ] as const).map((stage) => (
                        <CommandItem
                          key={stage}
                          onSelect={() => {
                            setDealStage(stage);
                            setDealStageOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              dealStage === stage
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {stage}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Add Organization
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
