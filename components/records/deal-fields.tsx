"use client";

import {
  Building2,
  CalendarDays,
  CircleDashed,
  Clock,
  DollarSign,
  Footprints,
  Percent,
  Plus,
  Tag,
  UserRound,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AttributeRow, AttributeSection, InlineText } from "@/components/record-page/attributes";
import { CompanyChip, OwnerCell, StageCell } from "@/components/record-table/cells";
import { formatDealValue, withStage } from "@/lib/dealData";
import { formatDate, formatRelative } from "@/lib/format";
import { DEAL_TAGS, tagStyle } from "@/lib/tags";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import { cn } from "@/lib/utils";

export type DealChange = (next: Deal, message: string) => void;

/** Editable fields for a deal, used on its page and in the side preview. */
export function DealFields({
  deal,
  organization,
  onChange,
}: {
  deal: Deal;
  organization?: Organization;
  onChange: DealChange;
}) {
  const tags = deal.tags ?? [];
  const availableTags = DEAL_TAGS.filter((tag) => !tags.includes(tag));

  return (
    <>
      <AttributeSection title="Record details">
        <AttributeRow icon={CircleDashed} label="Stage">
          <StageCell
            value={deal.stage}
            onChange={(stage) => onChange(withStage(deal, stage), `Moved “${deal.title}” to ${stage}`)}
          />
        </AttributeRow>
        <AttributeRow icon={DollarSign} label="Value">
          <InlineText
            label="Value"
            type="number"
            value={String(deal.value)}
            format={(value) => <span className="font-medium">{formatDealValue(Number(value))}</span>}
            onSave={(value) => onChange({ ...deal, value: Math.max(0, Number(value) || 0) }, "Value updated")}
          />
        </AttributeRow>
        <AttributeRow icon={Percent} label="Probability">
          <span className="block px-0 py-1 tabular-nums">
            {deal.probability}%
            <span className="ml-1.5 text-muted-foreground">
              · {formatDealValue((deal.value * deal.probability) / 100)} weighted
            </span>
          </span>
        </AttributeRow>
        <AttributeRow icon={UserRound} label="Owner">
          <OwnerCell value={deal.owner} onChange={(owner) => onChange({ ...deal, owner }, `${owner} now owns “${deal.title}”`)} />
        </AttributeRow>
        <AttributeRow icon={CalendarDays} label="Close date">
          <InlineText
            label="Close date"
            type="date"
            value={deal.expectedCloseDate ?? ""}
            format={formatDate}
            onSave={(expectedCloseDate) => onChange({ ...deal, expectedCloseDate }, "Close date updated")}
          />
        </AttributeRow>
        <AttributeRow icon={Building2} label="Company">
          <span className="block py-1">
            {organization ? (
              <CompanyChip name={organization.name} logo={organization.logo} href={`/organizations/${organization.id}`} />
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </span>
        </AttributeRow>
        <AttributeRow icon={Clock} label="Created">
          <span className="block py-1 text-muted-foreground">{formatRelative(deal.createdAt)}</span>
        </AttributeRow>
      </AttributeSection>

      <AttributeSection title="Next step">
        <div className="flex items-start gap-2 text-[13px]">
          <Footprints className="mt-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <InlineText
              label="Next step"
              multiline
              value={deal.nextStep ?? ""}
              placeholder="Add the next step…"
              onSave={(nextStep) => onChange({ ...deal, nextStep: nextStep || undefined }, "Next step updated")}
            />
          </div>
        </div>
      </AttributeSection>

      <AttributeSection
        title="Tags"
        action={
          availableTags.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex h-6 items-center gap-1 rounded px-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add tag
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[200px]">
                {availableTags.map((tag) => (
                  <DropdownMenuItem
                    key={tag}
                    onSelect={() => onChange({ ...deal, tags: [...tags, tag] }, `Tagged ${tag}`)}
                    className="text-[13px]"
                  >
                    <Tag className="text-muted-foreground" />
                    {tag}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        }
      >
        {tags.length === 0 ? (
          <p className="py-1 text-[13px] text-muted-foreground">No tags</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className={cn("inline-flex h-6 items-center gap-0.5 rounded-md pl-2 pr-0.5 text-xs font-medium", tagStyle(tag))}
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove tag ${tag}`}
                  onClick={() => onChange({ ...deal, tags: tags.filter((t) => t !== tag) }, `Removed tag ${tag}`)}
                  className="flex h-5 w-5 items-center justify-center rounded opacity-60 hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </AttributeSection>
    </>
  );
}
