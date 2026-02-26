"use client";

import type React from "react";

import { useState, useEffect, type ChangeEvent } from "react";
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
  getFileFromLocalStorage,
} from "@/lib/fileUtils";

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (organization: Organization) => void;
  onDelete: (organizationId: string) => void;
  organization: Organization;
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  onEdit,
  onDelete,
  organization,
}: EditOrganizationModalProps) {
  const [name, setName] = useState(organization.name);
  const [industry, setIndustry] = useState(organization.industry);
  const [location, setLocation] = useState(organization.location);
  const [employees, setEmployees] = useState(organization.employees.toString());
  const [logo, setLogo] = useState(organization.logo);
  const [logoPreview, setLogoPreview] = useState("");
  const [website_url, setWebsiteUrl] = useState(organization.website_url);
  const [description, setDescription] = useState(organization.description);
  const [assessmentStatus, setAssessmentStatus] = useState(
    organization.assessmentStatus
  );
  const [exitStatus, setExitStatus] = useState<"IPO" | "Acquired" | undefined>(
    organization.exitStatus
  );
  const [industryOpen, setIndustryOpen] = useState(false);
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  useEffect(() => {
    setName(organization.name);
    setIndustry(organization.industry);
    setLocation(organization.location);
    setEmployees(organization.employees.toString());
    setLogo(organization.logo);
    setWebsiteUrl(organization.website_url);
    setDescription(organization.description);
    setAssessmentStatus(organization.assessmentStatus);
    setExitStatus(organization.exitStatus);

    // Set logo preview
    if (organization.logo) {
      if (
        organization.logo.startsWith("/logos/") &&
        !organization.logo.includes("http")
      ) {
        // Check if it's a custom uploaded file
        const storedFile = getFileFromLocalStorage(organization.logo);
        if (storedFile) {
          setLogoPreview(storedFile);
        } else {
          // It's a default logo file
          setLogoPreview(organization.logo);
        }
      } else {
        setLogoPreview(organization.logo);
      }
    } else {
      setLogoPreview("");
    }
  }, [organization]);

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
    onEdit({
      ...organization,
      name,
      industry,
      location,
      employees: Number.parseInt(employees, 10),
      logo,
      website_url,
      description,
      assessmentStatus,
      exitStatus,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Make changes to the organization's information.
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
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("logo-edit")?.click()
                        }
                        className="gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Change
                      </Button>
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
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        document.getElementById("logo-edit")?.click()
                      }
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
                <Input
                  id="logo-edit"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
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
              <Label htmlFor="assessmentStatus" className="text-right">
                Assessment Status
              </Label>
              <Popover open={assessmentOpen} onOpenChange={setAssessmentOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={assessmentOpen}
                    className="w-[200px] col-span-3 justify-between"
                  >
                    {assessmentStatus || "Select status"}
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
                          setAssessmentStatus("Not assessed");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Not assessed"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Not assessed
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setAssessmentStatus("Screening");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Screening"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Screening
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setAssessmentStatus("Passive follow");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Passive follow"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Passive follow
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setAssessmentStatus("Hitlist");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Hitlist"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Hitlist
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setAssessmentStatus("Preparing for NDC");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Preparing for NDC"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Preparing for NDC
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setAssessmentStatus("Portfolio company");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Portfolio company"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Portfolio company
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setAssessmentStatus("Lost");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Lost"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Lost
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setAssessmentStatus("Not interesting");
                          setAssessmentOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            assessmentStatus === "Not interesting"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Not interesting
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="exitStatus" className="text-right">
                Exit Status
              </Label>
              <Popover open={exitOpen} onOpenChange={setExitOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={exitOpen}
                    className="w-[200px] col-span-3 justify-between"
                  >
                    {exitStatus || "None"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search exit status..." />
                    <CommandEmpty>No exit status found.</CommandEmpty>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => {
                          setExitStatus(undefined);
                          setExitOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            !exitStatus ? "opacity-100" : "opacity-0"
                          )}
                        />
                        None
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setExitStatus("IPO");
                          setExitOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            exitStatus === "IPO" ? "opacity-100" : "opacity-0"
                          )}
                        />
                        IPO
                      </CommandItem>
                      <CommandItem
                        onSelect={() => {
                          setExitStatus("Acquired");
                          setExitOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            exitStatus === "Acquired"
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        Acquired
                      </CommandItem>
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Are you sure you want to delete this organization?"
                  )
                ) {
                  onDelete(organization.id);
                }
              }}
            >
              Delete Organization
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
