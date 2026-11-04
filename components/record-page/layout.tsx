"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface RecordTab {
  id: string;
  label: string;
  count?: number;
  content: React.ReactNode;
}

/**
 * Shared frame for company, person and deal pages:
 * a breadcrumb bar with actions, a header with the record's identity,
 * tabs on the left, and the record's fields in a panel on the right.
 */
export function RecordPageLayout({
  parent,
  title,
  avatar,
  subtitle,
  actions,
  tabs,
  sidebar,
}: {
  parent: { label: string; href: string };
  title: string;
  avatar: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  tabs: RecordTab[];
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-12 shrink-0 items-center justify-between gap-4 border-b px-6">
        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-[13px]">
          <Link href={parent.href} className="text-muted-foreground transition-colors hover:text-foreground">
            {parent.label}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
          <span className="truncate font-medium" aria-current="page">
            {title}
          </span>
        </nav>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <header className="flex items-center gap-4 px-8 pb-5 pt-6">
            {avatar}
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
              {subtitle && (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
          </header>

          <Tabs defaultValue={tabs[0]?.id}>
            <TabsList className="h-10 gap-5 px-8">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5 text-[13px]">
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="rounded bg-muted px-1.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                      {tab.count}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="mt-0 px-8 py-6">
                {tab.content}
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <aside
          aria-label="Record details"
          className="hidden w-[340px] shrink-0 overflow-y-auto border-l bg-sidebar lg:block"
        >
          {sidebar}
        </aside>
      </div>
    </div>
  );
}

/** Titled block inside a tab (e.g. "Deals", "Contacts"). */
export function RecordSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8 last:mb-0">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Bordered list of linked records (contacts, deals…). */
export function RecordList({ children, empty }: { children: React.ReactNode; empty: string }) {
  const hasItems = Array.isArray(children) ? children.length > 0 : !!children;
  if (!hasItems) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-6 text-center text-[13px] text-muted-foreground">
        {empty}
      </p>
    );
  }
  return <div className="divide-y overflow-hidden rounded-lg border">{children}</div>;
}

export function RecordListItem({
  href,
  leading,
  title,
  meta,
  trailing,
}: {
  href?: string;
  leading?: React.ReactNode;
  title: React.ReactNode;
  meta?: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  const inner = (
    <>
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium">{title}</div>
        {meta && <div className="truncate text-xs text-muted-foreground">{meta}</div>}
      </div>
      {trailing && <div className="shrink-0 text-right text-[13px]">{trailing}</div>}
    </>
  );
  const className = "flex items-center gap-3 px-3 py-2.5";
  return href ? (
    <Link href={href} className={`${className} transition-colors hover:bg-muted/50`}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}
