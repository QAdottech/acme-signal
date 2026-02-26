"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EditOrganizationModal } from "@/components/edit-organization-modal";
import type { Organization } from "@/types/organization";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Globe, Users, MapPin, ChevronsUpDown, Check } from "lucide-react";
import { CollectionManager } from "@/components/collection-manager";
import { deduplicateCollectionOrganizationIds } from "@/lib/organizationData";
import { OrganizationImage } from "@/components/organization-image";
import { Badge } from "@/components/ui/badge";
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

const calculateTotalFunding = (org: Organization): number => {
  if (!org.fundingRounds || org.fundingRounds.length === 0) {
    return 0;
  }

  return org.fundingRounds
    .filter(
      (round) => round.roundType !== "IPO" && round.roundType !== "Acquisition"
    )
    .reduce((total, round) => {
      const amount = round.amount.replace(/[^0-9.]/g, "");
      const numericAmount = parseFloat(amount);

      if (isNaN(numericAmount)) {
        return total;
      }

      // Convert to USD millions for consistent comparison
      if (round.amount.includes("€")) {
        return total + numericAmount * 1.1; // Rough EUR to USD conversion
      } else if (round.amount.includes("SEK")) {
        return total + numericAmount * 0.095; // Rough SEK to USD conversion
      } else if (round.amount.includes("B")) {
        return total + numericAmount * 1000; // Billions to millions
      } else if (round.amount.includes("K")) {
        return total + numericAmount / 1000; // Thousands to millions
      }

      return total + numericAmount;
    }, 0);
};

const formatFunding = (amount: number): string => {
  if (amount === 0) return "-";
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(2)}B`;
  }
  return `$${amount.toFixed(1)}M`;
};

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

  const handleAssessmentStatusChange = (value: string) => {
    if (organization) {
      const updatedOrg = {
        ...organization,
        assessmentStatus: value as Organization["assessmentStatus"],
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
    <div className="min-h-screen flex flex-col">
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
                  {organization.exitStatus && (
                    <Badge
                      variant={
                        organization.exitStatus === "IPO" ? "ipo" : "acquired"
                      }
                    >
                      {organization.exitStatus}
                    </Badge>
                  )}
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

      <main className="flex-1 container py-8 max-w-[1400px] mx-auto px-6">
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

            <Card>
              <CardHeader>
                <CardTitle>Founders</CardTitle>
              </CardHeader>
              <CardContent>
                {organization.founders && organization.founders.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {organization.founders.map((founder, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center p-4 border rounded-lg text-center"
                      >
                        <div className="flex-1 mb-3">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {founder.name}
                          </h4>
                          {founder.role && (
                            <p className="text-xs text-gray-600 mt-1">
                              {founder.role}
                            </p>
                          )}
                        </div>
                        {founder.linkedin && (
                          <a
                            href={founder.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No founder information available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Funding History</span>
                  {organization.fundingRounds &&
                    organization.fundingRounds.length > 0 && (
                      <span className="text-sm font-normal text-gray-600">
                        Total:{" "}
                        {formatFunding(calculateTotalFunding(organization))}
                        <span className="text-xs text-gray-500 ml-1">
                          (excl. IPO & acquisitions)
                        </span>
                      </span>
                    )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-24">Date</TableHead>
                      <TableHead className="w-28">Amount</TableHead>
                      <TableHead className="w-32">Round Type</TableHead>
                      <TableHead>Investors</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {organization.fundingRounds &&
                    organization.fundingRounds.length > 0 ? (
                      organization.fundingRounds.map((round) => (
                        <TableRow key={round.id}>
                          <TableCell className="align-top">
                            {round.date}
                          </TableCell>
                          <TableCell className="align-top whitespace-nowrap">
                            {round.amount}
                          </TableCell>
                          <TableCell className="align-top">
                            {round.roundType}
                          </TableCell>
                          <TableCell className="whitespace-normal break-words">
                            {round.investors.join(", ")}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-gray-500"
                        >
                          No funding rounds yet
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="w-96 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assessment Status</CardTitle>
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
                      {organization.assessmentStatus || "Select status"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0">
                    <Command>
                      <CommandInput placeholder="Search status..." />
                      <CommandEmpty>No status found.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          onSelect={() =>
                            handleAssessmentStatusChange("Not assessed")
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus === "Not assessed"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Not assessed
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAssessmentStatusChange("Screening")
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus === "Screening"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Screening
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAssessmentStatusChange("Passive follow")
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus === "Passive follow"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Passive follow
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAssessmentStatusChange("Hitlist")
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus === "Hitlist"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Hitlist
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAssessmentStatusChange("Preparing for NDC")
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus ===
                                "Preparing for NDC"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Preparing for NDC
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAssessmentStatusChange("Portfolio company")
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus ===
                                "Portfolio company"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Portfolio company
                        </CommandItem>
                        <CommandItem
                          onSelect={() => handleAssessmentStatusChange("Lost")}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus === "Lost"
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          Lost
                        </CommandItem>
                        <CommandItem
                          onSelect={() =>
                            handleAssessmentStatusChange("Not interesting")
                          }
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              organization.assessmentStatus ===
                                "Not interesting"
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
    </div>
  );
}
