"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import { useRouter } from "next/navigation";
import { OrganizationImage } from "@/components/organization-image";
import { formatDealValue } from "@/lib/dealData";

interface DealCardProps {
  deal: Deal;
  organization?: Organization;
}

export function DealCard({ deal, organization }: DealCardProps) {
  const router = useRouter();
  return (
    <Card
      className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors border-gray-200 dark:border-gray-800 shadow-sm"
      onClick={() => router.push(`/deals/${deal.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm truncate">{deal.title}</h3>
            <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2 flex-shrink-0">
              {formatDealValue(deal.value)}
            </span>
          </div>
          {organization && (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {organization.logo ? (
                  <OrganizationImage
                    src={organization.logo}
                    alt={organization.name}
                    width={16}
                    height={16}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {organization.name}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {deal.owner}
            </span>
            <span className="text-xs text-muted-foreground">
              {deal.probability}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
