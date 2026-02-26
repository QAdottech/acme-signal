import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Organization } from "@/types/organization";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Users } from "lucide-react";
import { OrganizationImage } from "@/components/organization-image";

interface ActiveDealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deals: Organization[];
}

export function ActiveDealsModal({ isOpen, onClose, deals }: ActiveDealsModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Lead":
        return "bg-blue-100 text-blue-800";
      case "Qualified":
        return "bg-orange-100 text-orange-800";
      case "Proposal":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Active Pipeline ({deals.length})</DialogTitle>
          <DialogDescription>
            Organizations currently in Lead, Qualified, or Proposal stage
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {deals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No active pipeline items found
            </div>
          ) : (
            deals.map((deal) => (
              <div
                key={deal.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent transition-colors"
              >
                <OrganizationImage
                  logoUrl={deal.logo}
                  name={deal.name}
                  size={48}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{deal.name}</h3>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {deal.industry}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {deal.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {deal.employees} employees
                        </span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(deal.dealStage)}>
                      {deal.dealStage}
                    </Badge>
                  </div>
                  
                  {deal.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {deal.description}
                    </p>
                  )}

                  {deal.website_url && (
                    <a
                      href={deal.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-600 hover:underline mt-2 inline-block"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit website →
                    </a>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

