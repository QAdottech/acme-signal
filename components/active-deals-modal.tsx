"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";
import { OrganizationImage } from "@/components/organization-image";
import { getOrganizations } from "@/lib/organizationData";
import { formatDealValue } from "@/lib/dealData";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";

interface ActiveDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Deal[];
}

function getStageColor(stage: string): string {
  switch (stage) {
    case "Lead":
      return "bg-blue-100 text-blue-800";
    case "Qualified":
      return "bg-orange-100 text-orange-800";
    case "Proposal":
      return "bg-purple-100 text-purple-800";
    case "Negotiation":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function ActiveDealsModal({
  isOpen,
  onClose,
  deals,
}: ActiveDealsModalProps) {
  const [orgMap, setOrgMap] = useState<Map<string, Organization>>(new Map());

  useEffect(() => {
    const organizations = getOrganizations();
    const map = new Map<string, Organization>();
    for (const org of organizations) {
      map.set(org.id, org);
    }
    setOrgMap(map);
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Active Pipeline ({deals.length} deals)
          </DialogTitle>
          <DialogDescription>
            Deals currently in Lead, Qualified, Proposal, or Negotiation stage
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active pipeline items found
            </div>
          ) : (
            deals.map((deal) => {
              const org = orgMap.get(deal.organizationId);

              return (
                <div
                  key={deal.id}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <OrganizationImage
                    src={org?.logo ?? "/placeholder.svg"}
                    alt={org?.name ?? "Organization"}
                    width={48}
                    height={48}
                    className="rounded"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{deal.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                          {org && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {org.name} &middot; {org.industry}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {formatDealValue(deal.value, deal.currency)}
                        </span>
                        <Badge className={getStageColor(deal.stage)}>
                          {deal.stage}
                        </Badge>
                      </div>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Owner: {deal.owner}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
