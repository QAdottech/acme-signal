"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CircleDashed,
  DollarSign,
  Factory,
  Globe,
  MapPin,
  Plus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AttributeRow, AttributeSection, InlineText } from "@/components/record-page/attributes";
import { OwnerCell, StageCell } from "@/components/record-table/cells";
import { getCollections } from "@/lib/organizationData";
import { listSwatch } from "@/lib/lists";
import { formatDate } from "@/lib/format";
import type { Collection, Organization } from "@/types/organization";
import { cn } from "@/lib/utils";

export type CompanyChange = (changes: Partial<Organization>, message: string) => void;

/** Editable fields for a company, used on its page and in the side preview. */
export function CompanyFields({
  org,
  onChange,
  onListsChange,
}: {
  org: Organization;
  onChange: CompanyChange;
  onListsChange?: (listIds: string[]) => void;
}) {
  const website = org.website_url?.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <>
      <AttributeSection title="Record details">
        <AttributeRow icon={CircleDashed} label="Stage">
          <StageCell
            value={org.dealStage}
            onChange={(dealStage) => onChange({ dealStage }, `Moved ${org.name} to ${dealStage}`)}
          />
        </AttributeRow>
        <AttributeRow icon={UserRound} label="Owner">
          <OwnerCell value={org.owner} onChange={(owner) => onChange({ owner }, `${owner} now owns ${org.name}`)} />
        </AttributeRow>
        <AttributeRow icon={Factory} label="Industry">
          <InlineText label="Industry" value={org.industry} onSave={(industry) => onChange({ industry }, "Industry updated")} />
        </AttributeRow>
        <AttributeRow icon={MapPin} label="Location">
          <InlineText label="Location" value={org.location} onSave={(location) => onChange({ location }, "Location updated")} />
        </AttributeRow>
        <AttributeRow icon={Users} label="Employees">
          <InlineText
            label="Employees"
            type="number"
            value={String(org.employees ?? "")}
            format={(value) => Number(value).toLocaleString("en-US")}
            onSave={(value) => onChange({ employees: Number(value) || 0 }, "Employees updated")}
          />
        </AttributeRow>
        <AttributeRow icon={DollarSign} label="Revenue">
          <InlineText
            label="Revenue"
            value={org.annualRevenue ?? ""}
            onSave={(annualRevenue) => onChange({ annualRevenue }, "Revenue updated")}
          />
        </AttributeRow>
        <AttributeRow icon={Globe} label="Website">
          <div className="flex min-w-0 items-center">
            {website ? (
              <a
                href={org.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate py-1 text-link underline-offset-2 hover:underline"
              >
                {website}
              </a>
            ) : (
              <InlineText label="Website" type="url" value="" onSave={(website_url) => onChange({ website_url }, "Website updated")} />
            )}
          </div>
        </AttributeRow>
        <AttributeRow icon={CalendarDays} label="Last contacted">
          <InlineText
            label="Last contacted"
            type="date"
            value={org.lastContacted ?? ""}
            format={formatDate}
            onSave={(lastContacted) => onChange({ lastContacted }, "Last contacted updated")}
          />
        </AttributeRow>
      </AttributeSection>

      {onListsChange && <ListMembership listIds={org.collections ?? []} onChange={onListsChange} />}
    </>
  );
}

function ListMembership({ listIds, onChange }: { listIds: string[]; onChange: (ids: string[]) => void }) {
  const [lists, setLists] = useState<Collection[]>([]);
  useEffect(() => {
    const refresh = () => setLists(getCollections());
    refresh();
    window.addEventListener("collections-updated", refresh);
    return () => window.removeEventListener("collections-updated", refresh);
  }, []);

  const member = lists.filter((list) => listIds.includes(list.id));
  const available = lists.filter((list) => !listIds.includes(list.id));

  return (
    <AttributeSection
      title="Lists"
      action={
        available.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-6 items-center gap-1 rounded px-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
                Add to list
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[200px]">
              {available.map((list) => (
                <DropdownMenuItem key={list.id} onSelect={() => onChange([...listIds, list.id])} className="text-[13px]">
                  <span className={cn("h-2.5 w-2.5 rounded-[3px]", listSwatch(list.id))} />
                  {list.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }
    >
      {member.length === 0 ? (
        <p className="py-1 text-[13px] text-muted-foreground">Not in any list</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {member.map((list) => (
            <span
              key={list.id}
              className="inline-flex h-7 max-w-full items-center gap-1.5 rounded-md border bg-background pl-2 pr-0.5 text-[13px]"
            >
              <span className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", listSwatch(list.id))} />
              <span className="truncate">{list.name}</span>
              <button
                type="button"
                aria-label={`Remove from ${list.name}`}
                onClick={() => onChange(listIds.filter((id) => id !== list.id))}
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </AttributeSection>
  );
}
