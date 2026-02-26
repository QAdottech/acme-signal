"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Organization } from "@/types/organization";
import { useRouter } from "next/navigation";
import { OrganizationImage } from "@/components/organization-image";

interface DealCardProps {
  organization: Organization;
}

export function DealCard({ organization }: DealCardProps) {
  const router = useRouter();
  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-800 shadow-sm"
      onClick={() => router.push(`/organizations/${organization.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {organization.logo ? (
              <OrganizationImage
                src={organization.logo}
                alt={organization.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <h3 className="font-medium truncate">{organization.name}</h3>
                <span className="text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground truncate">
                  {organization.location}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {organization.industry} • {organization.dealStage}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
