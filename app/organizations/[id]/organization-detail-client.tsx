"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditOrganizationModal } from "@/components/edit-organization-modal";
import type { Organization } from "@/types/organization";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Users, MapPin, ChevronsUpDown, Check } from "lucide-react";
import { CollectionManager } from "@/components/collection-manager";
import { deduplicateCollectionOrganizationIds } from "@/lib/organizationData";
import { OrganizationImage } from "@/components/organization-image";
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
import { cn } from "@/lib/utils";

export function OrganizationDetailClient({
  params,
}: {
  params: { id: string };
}) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Clean up any existing duplicates
    deduplicateCollectionOrganizationIds();
    const storedOrganizations = localStorage.getItem("organizations");
    if (storedOrganizations) {
      const organizations: Organization[] = JSON.parse(storedOrganizations);
      const org = organizations.find((o) => o.id === params.id);
      if (org) {
        setOrganization(org);
      } else {
        router.push("/organizations");
      }
    }
  }, [params.id, router]);

  const handleEdit = (updatedOrg: Organization) => {
    const storedOrganizations = localStorage.getItem("organizations");
    if (storedOrganizations) {
      const organizations: Organization[] = JSON.parse(storedOrganizations);
      const updatedOrganizations = organizations.map((org) =>
        org.id === updatedOrg.id ? updatedOrg : org
      );
      localStorage.setItem(
        "organizations",
        JSON.stringify(updatedOrganizations)
      );
      setOrganization(updatedOrg);
    }
    setIsEditModalOpen(false);
  };

  const handleDelete = (organizationId: string) => {
    const storedOrganizationsString = localStorage.getItem("organizations");
    if (storedOrganizationsString) {
      const organizations: Organization[] = JSON.parse(
        storedOrganizationsString
      );
      const updatedOrganizations = organizations.filter(
        (org) => org.id !== organizationId
      );
      localStorage.setItem(
        "organizations",
        JSON.stringify(updatedOrganizations)
      );
      router.push("/organizations");
    }
  };

  const handleDealStageChange = (value: string) => {
    if (organization) {
      const updatedOrg = {
        ...organization,
        dealStage: value as Organization["dealStage"],
      };
      handleEdit(updatedOrg);
      setStatusOpen(false);
    }
  };

  const handleCollectionsChange = useCallback(
    (updatedCollections: string[]) => {
      // Read fresh data from localStorage to ensure we have the latest state
      const storedOrganizations = localStorage.getItem("organizations");
      if (storedOrganizations) {
        const organizations: Organization[] = JSON.parse(storedOrganizations);
        const updatedOrg = organizations.find((o) => o.id === params.id);
        if (updatedOrg) {
          setOrganization(updatedOrg);
        }
      }
    },
    [params.id]
  );

  if (!organization) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="bg-[#2D1A45] text-white">
        <div className="container max-w-[1400px] mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 relative flex-shrink-0 bg-white rounded-full overflow-hidden border-4 border-white">
                <OrganizationImage
                  src={organization.logo || "/placeholder.svg"}
                  alt={`${organization.name} logo`}
                  fill
                  objectFit="cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{organization.name}</h1>
                </div>
                <p className="text-xl text-gray-200 mb-6">
                  {organization.industry}
                </p>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-5 h-5 text-gray-300" />
                    <span className="text-gray-100">
                      {organization.location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-gray-300" />
                    <span className="text-gray-100">
                      {organization.employees} employees
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe className="w-5 h-5 text-gray-300" />
                    <Link
                      href={organization.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-100 hover:text-white hover:underline"
                    >
                      {organization.website_url}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Edit Organization
            </Button>
          </div>
        </div>
      </div>

      <main className="container py-8 max-w-[1400px] mx-auto px-6">
        <div className="flex gap-8">
          <div className="flex-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>About {organization.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {organization.description}
                </p>
              </CardContent>
            </Card>

          </div>

          <div className="w-96 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Deal Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <Popover open={statusOpen} onOpenChange={setStatusOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={statusOpen}
                      className="w-full justify-between"
                    >
                      {organization.dealStage || "Select stage"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search stage..." />
                      <CommandEmpty>No stage found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() => handleDealStageChange("New")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "New"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          New
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleDealStageChange("Lead")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "Lead"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Lead
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleDealStageChange("Qualified")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "Qualified"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Qualified
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleDealStageChange("Proposal")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "Proposal"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Proposal
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleDealStageChange("Negotiation")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "Negotiation"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Negotiation
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleDealStageChange("Customer")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "Customer"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Customer
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleDealStageChange("Churned")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "Churned"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Churned
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleDealStageChange("Closed Lost")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.dealStage === "Closed Lost"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Closed Lost
                        </CommandItem>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Organization Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Owner</span>
                  <span className="text-sm font-medium">
                    {organization.owner || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Annual Revenue</span>
                  <span className="text-sm font-medium">
                    {organization.annualRevenue || "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Contacted</span>
                  <span className="text-sm font-medium">
                    {organization.lastContacted || "-"}
                  </span>
                </div>
              </CardContent>
            </Card>
            <CollectionManager
              organization={organization}
              onCollectionsChange={handleCollectionsChange}
            />
          </div>
        </div>
      </main>

      {organization && (
        <EditOrganizationModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEdit={handleEdit}
          onDelete={handleDelete}
          organization={organization}
        />
      )}
    </>
  );
}
