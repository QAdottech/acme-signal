"use client";

import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StageBadge } from "@/components/stage-badge";
import { OrganizationImage } from "@/components/organization-image";
import { OWNERS, avatarColor, getInitials } from "@/lib/team";
import { STAGE_STYLES } from "@/lib/stages";
import type { DealStage } from "@/types/organization";
import { cn } from "@/lib/utils";

/**
 * A cell value that opens a small menu to change it in place. The trigger
 * looks like plain cell content until hovered, like a spreadsheet.
 */
export function InlineSelect<V extends string>({
  label,
  value,
  options,
  onChange,
  renderValue,
  renderOption,
}: {
  /** Field name, used for the accessible label and the menu heading. */
  label: string;
  value: V | undefined;
  options: readonly V[];
  onChange: (value: V) => void;
  renderValue: (value: V | undefined) => React.ReactNode;
  renderOption?: (value: V) => React.ReactNode;
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`${label}: ${value ?? "empty"}. Change ${label.toLowerCase()}`}
          className="group/cell -mx-1.5 flex h-7 max-w-[calc(100%+0.75rem)] items-center gap-1 rounded px-1.5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-accent"
        >
          <span className="min-w-0 truncate">{renderValue(value)}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover/cell:opacity-100 group-data-[state=open]/cell:opacity-100" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[180px]">
        <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
          {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onSelect={() => {
              if (option !== value) onChange(option);
            }}
            className="text-[13px]"
          >
            <span className="min-w-0 flex-1 truncate">
              {renderOption ? renderOption(option) : option}
            </span>
            {option === value && <Check className="text-muted-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const STAGE_OPTIONS = Object.keys(STAGE_STYLES) as DealStage[];

export function StageCell({
  value,
  onChange,
  options = STAGE_OPTIONS,
}: {
  value: DealStage;
  onChange: (stage: DealStage) => void;
  options?: readonly DealStage[];
}) {
  return (
    <InlineSelect
      label="Stage"
      value={value}
      options={options}
      onChange={onChange}
      renderValue={(stage) => (stage ? <StageBadge stage={stage} /> : <Empty />)}
      renderOption={(stage) => <StageBadge stage={stage} />}
    />
  );
}

export function OwnerCell({
  value,
  onChange,
}: {
  value: string | undefined;
  onChange: (owner: string) => void;
}) {
  return (
    <InlineSelect
      label="Owner"
      value={value}
      options={OWNERS}
      onChange={onChange}
      renderValue={(owner) => (owner ? <PersonChip name={owner} /> : <Empty />)}
      renderOption={(owner) => <PersonChip name={owner} />}
    />
  );
}

export function Avatar({
  name,
  size = 20,
  className,
}: {
  name: string;
  size?: 20 | 24;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        size === 20 ? "h-5 w-5 text-[9px]" : "h-6 w-6 text-[10px]",
        avatarColor(name),
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}

export function PersonChip({ name }: { name: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Avatar name={name} />
      <span className="truncate">{name}</span>
    </span>
  );
}

/** A company's 20px logo, or its initials when it has none. */
export function CompanyLogo({ name, logo }: { name: string; logo?: string }) {
  return (
    <span aria-hidden className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
      {logo ? (
        <OrganizationImage src={logo} alt="" width={20} height={20} className="rounded" />
      ) : (
        <span className="text-[9px] font-semibold text-muted-foreground">{getInitials(name)}</span>
      )}
    </span>
  );
}

/*
 * Links inside tables and record lists use prefetch={false}: Next.js would
 * otherwise prefetch every visible row's page and abort those requests on
 * navigation. Links still prefetch on hover.
 */
export function CompanyChip({
  name,
  logo,
  href,
}: {
  name: string;
  logo?: string;
  href?: string;
}) {
  const content = (
    <>
      <CompanyLogo name={name} logo={logo} />
      <span className="truncate">{name}</span>
    </>
  );
  if (!href) return <span className="flex min-w-0 items-center gap-2">{content}</span>;
  return (
    <Link prefetch={false}
      href={href}
      className="flex min-w-0 items-center gap-2 underline-offset-2 hover:underline"
    >
      {content}
    </Link>
  );
}

/** The record's primary cell: bold name that links to the record. */
export function PrimaryCell({
  href,
  children,
}: {
  href?: string;
  children: React.ReactNode;
}) {
  if (!href) return <span className="block truncate font-medium">{children}</span>;
  return (
    <Link prefetch={false}
      href={href}
      className="block truncate font-medium underline-offset-2 hover:underline"
    >
      {children}
    </Link>
  );
}

export function Empty() {
  return <span className="text-muted-foreground/60">—</span>;
}

export function StatusDot({ active, label }: { active: boolean; label: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-muted text-muted-foreground"
      )}
    >
      <span
        aria-hidden
        className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-emerald-500" : "bg-gray-400")}
      />
      {label}
    </span>
  );
}
