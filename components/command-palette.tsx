"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { getOrganizations } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { getDeals } from "@/lib/dealData";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";
import type { Deal } from "@/types/deal";

const PAGES = [
  { href: "/", label: "Pipeline" },
  { href: "/deals", label: "Deals" },
  { href: "/organizations", label: "Companies" },
  { href: "/people", label: "People" },
  { href: "/tasks", label: "Tasks" },
  { href: "/emails", label: "Inbox" },
  { href: "/reports", label: "Reports" },
  { href: "/notes", label: "Notes" },
  { href: "/notifications", label: "Notifications" },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);

  useEffect(() => {
    if (!open) return;
    setOrganizations(getOrganizations());
    setPeople(getPeople());
    setDeals(getDeals());
  }, [open]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search deals, companies, people..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((page) => (
            <CommandItem
              key={page.href}
              value={page.label}
              onSelect={() => go(page.href)}
            >
              {page.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {deals.length > 0 && (
          <CommandGroup heading="Deals">
            {deals.map((deal) => (
              <CommandItem
                key={deal.id}
                value={`${deal.title} ${deal.owner}`}
                onSelect={() => go(`/deals/${deal.id}`)}
              >
                {deal.title}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {organizations.length > 0 && (
          <CommandGroup heading="Companies">
            {organizations.map((org) => (
              <CommandItem
                key={org.id}
                value={`${org.name} ${org.industry} ${org.location}`}
                onSelect={() => go(`/organizations/${org.id}`)}
              >
                {org.name}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
        {people.length > 0 && (
          <CommandGroup heading="People">
            {people.map((person) => (
              <CommandItem
                key={person.id}
                value={`${person.name} ${person.organization} ${person.email}`}
                onSelect={() => go("/people")}
              >
                {person.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {person.organization}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
