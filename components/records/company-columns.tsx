import {
  Building2,
  CircleDashed,
  Factory,
  MapPin,
  UserRound,
  Users,
} from "lucide-react";
import type { Column } from "@/components/record-table/record-table";
import { CompanyChip, Empty, OwnerCell, StageCell } from "@/components/record-table/cells";
import { STAGE_STYLES } from "@/lib/stages";
import type { DealStage, Organization } from "@/types/organization";

const STAGES = Object.keys(STAGE_STYLES) as DealStage[];

export type CompanyUpdate = (id: string, changes: Partial<Organization>, message: string) => void;

/**
 * Table columns for companies, shared by the Companies page and list pages
 * so a list is the same grid filtered to its members.
 */
export function companyColumns(updateOrganization: CompanyUpdate): Column<Organization>[] {
  return [
    {
      id: "name",
      header: "Company",
      icon: Building2,
      width: 240,
      sortValue: (o) => o.name.toLowerCase(),
      cell: (o) => (
        <span className="font-medium">
          <CompanyChip name={o.name} logo={o.logo} href={`/organizations/${o.id}`} />
        </span>
      ),
      footer: (rows) => `${rows.length} ${rows.length === 1 ? "company" : "companies"}`,
    },
    {
      id: "stage",
      header: "Stage",
      icon: CircleDashed,
      width: 150,
      sortValue: (o) => STAGES.indexOf(o.dealStage),
      cell: (o) => (
        <StageCell
          value={o.dealStage}
          onChange={(stage) => updateOrganization(o.id, { dealStage: stage }, `Moved ${o.name} to ${stage}`)}
        />
      ),
    },
    {
      id: "industry",
      header: "Industry",
      icon: Factory,
      width: 200,
      sortValue: (o) => o.industry.toLowerCase(),
      cell: (o) => o.industry || <Empty />,
    },
    {
      id: "location",
      header: "Location",
      icon: MapPin,
      width: 200,
      sortValue: (o) => o.location.toLowerCase(),
      cell: (o) => o.location || <Empty />,
    },
    {
      id: "employees",
      header: "Employees",
      icon: Users,
      width: 120,
      align: "right",
      firstSortDirection: "desc",
      sortValue: (o) => o.employees,
      cell: (o) => o.employees.toLocaleString("en-US"),
    },
    {
      id: "owner",
      header: "Owner",
      icon: UserRound,
      width: 180,
      sortValue: (o) => (o.owner ?? "").toLowerCase(),
      cell: (o) => (
        <OwnerCell
          value={o.owner}
          onChange={(owner) => updateOrganization(o.id, { owner }, `${owner} now owns ${o.name}`)}
        />
      ),
    },
  ];
}
