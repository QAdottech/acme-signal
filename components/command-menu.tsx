"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import {
  Bug,
  Building2,
  CheckSquare,
  CircleDollarSign,
  FileBarChart,
  FolderKanban,
  Inbox,
  Kanban,
  Plus,
  RotateCcw,
  Search,
  Settings,
  StickyNote,
  User,
  Users,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { OrganizationImage } from "@/components/organization-image";
import { getOrganizations, getCollections } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { getDeals, formatDealValue } from "@/lib/dealData";
import {
  CREATE_TARGETS,
  dispatchCreateIntent,
  type CreateKind,
} from "@/lib/create-intent";
import type { Organization, Collection } from "@/types/organization";
import type { Person } from "@/types/person";
import type { Deal } from "@/types/deal";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/components/confirm-dialog";
import { resetDemoData } from "@/lib/demo-data";

const OPEN_EVENT = "acme:open-command-menu";

/**
 * Plain "every word appears" matching. cmdk's default fuzzy scorer matches
 * scattered letters ("anthro" → "QA.tech"), which looks broken in a demo.
 */
function matchAllWords(value: string, search: string, keywords?: string[]) {
  // Records match on their visible text (keywords); their value is just a unique id.
  const haystack = (keywords?.length ? keywords.join(" ") : value).toLowerCase();
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return words.every((word) => haystack.includes(word)) ? 1 : 0;
}

/** Open the command menu from anywhere (e.g. the sidebar search button). */
export function openCommandMenu() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Second key of the "G then <key>" shortcut. */
  key?: string;
};

export const NAV_SHORTCUTS: NavItem[] = [
  { label: "Pipeline", href: "/", icon: Kanban, key: "h" },
  { label: "Inbox", href: "/inbox", icon: Inbox, key: "i" },
  { label: "Tasks", href: "/tasks", icon: CheckSquare, key: "t" },
  { label: "Companies", href: "/organizations", icon: Building2, key: "c" },
  { label: "People", href: "/people", icon: Users, key: "p" },
  { label: "Deals", href: "/deals", icon: CircleDollarSign, key: "d" },
  { label: "Notes", href: "/notes", icon: StickyNote, key: "n" },
  { label: "Reports", href: "/reports", icon: FileBarChart, key: "r" },
  { label: "Lists", href: "/collections", icon: FolderKanban, key: "l" },
  { label: "Settings", href: "/settings", icon: Settings },
];

const CREATE_ACTIONS: { kind: CreateKind; label: string }[] = [
  { kind: "deal", label: "Create deal" },
  { kind: "company", label: "Add company" },
  { kind: "person", label: "Add person" },
  { kind: "task", label: "Create task" },
  { kind: "note", label: "Write note" },
  { kind: "email", label: "Compose email" },
  { kind: "list", label: "New list" },
];

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return (
    el.isContentEditable ||
    el.tagName === "INPUT" ||
    el.tagName === "TEXTAREA" ||
    el.tagName === "SELECT"
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[11px] font-medium text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * Global ⌘K menu: jump to any record or page, or start creating something.
 * Also owns the app's keyboard shortcuts (⌘K, "G then <key>" navigation).
 */
export function CommandMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [records, setRecords] = useState<{
    organizations: Organization[];
    people: Person[];
    deals: Deal[];
    collections: Collection[];
  }>({ organizations: [], people: [], deals: [], collections: [] });
  const pendingG = useRef<number | null>(null);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  // Refresh record data each time the menu opens so new records show up.
  useEffect(() => {
    if (!open) return;
    setRecords({
      organizations: getOrganizations(),
      people: getPeople(),
      deals: getDeals(),
      collections: getCollections(),
    });
  }, [open]);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTypingTarget(event.target)) return;
      if (document.querySelector("[role=dialog]")) return;

      const key = event.key.toLowerCase();
      if (pendingG.current !== null) {
        window.clearTimeout(pendingG.current);
        pendingG.current = null;
        const target = NAV_SHORTCUTS.find((item) => item.key === key);
        if (target) {
          event.preventDefault();
          router.push(target.href);
        }
        return;
      }
      if (key === "g") {
        pendingG.current = window.setTimeout(() => {
          pendingG.current = null;
        }, 1000);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [router]);

  const run = useCallback((action: () => void) => {
    setOpen(false);
    setQuery("");
    action();
  }, []);

  const create = useCallback(
    (kind: CreateKind) => {
      const target = CREATE_TARGETS[kind];
      // The pipeline board also creates deals in place.
      const onTarget = pathname === target || (kind === "deal" && pathname === "/");
      if (onTarget) dispatchCreateIntent(kind);
      else router.push(`${target}?new=${kind}`);
    },
    [pathname, router]
  );

  const orgById = useMemo(
    () => new Map(records.organizations.map((org) => [org.id, org])),
    [records.organizations]
  );

  // Record groups stay hidden until the user types, so the empty state is a
  // short list of actions rather than every record in the workspace.
  const searching = query.trim().length > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) setQuery("");
      }}
    >
      <DialogContent
        className="top-[18%] max-w-[600px] translate-y-0 gap-0 overflow-hidden p-0 [&>button:last-child]:hidden"
      >
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <DialogDescription className="sr-only">
          Search records, jump to a page, or create something new.
        </DialogDescription>
        <CommandPrimitive
          loop
          filter={matchAllWords}
          className="flex flex-col [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground"
        >
          <div className="flex items-center gap-2 border-b px-4">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search companies, people, deals, or type a command…"
              className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Kbd>Esc</Kbd>
          </div>
          <CommandPrimitive.List className="max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain p-2">
            <CommandPrimitive.Empty className="py-10 text-center text-sm text-muted-foreground">
              No results for “{query}”
            </CommandPrimitive.Empty>

            {searching && (
              <>
                <MenuGroup heading="Companies">
                  {records.organizations.map((org) => (
                    <MenuItem
                      key={`org-${org.id}`}
                      value={`company-${org.id}`}
                      keywords={[org.name, org.industry, org.location]}
                      onSelect={() => run(() => router.push(`/organizations/${org.id}`))}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center overflow-hidden rounded bg-muted">
                        {org.logo ? (
                          <OrganizationImage src={org.logo} alt="" width={20} height={20} className="rounded" />
                        ) : (
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </span>
                      <span className="truncate">{org.name}</span>
                      <span className="ml-auto truncate pl-3 text-xs text-muted-foreground">
                        {org.industry}
                      </span>
                    </MenuItem>
                  ))}
                </MenuGroup>
                <MenuGroup heading="People">
                  {records.people.map((person) => (
                    <MenuItem
                      key={`person-${person.id}`}
                      value={`person-${person.id}`}
                      keywords={[person.name, person.email, person.organization]}
                      onSelect={() => run(() => router.push(`/people/${person.id}`))}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted text-[9px] font-semibold text-muted-foreground">
                        {initials(person.name)}
                      </span>
                      <span className="truncate">{person.name}</span>
                      <span className="ml-auto truncate pl-3 text-xs text-muted-foreground">
                        {[person.role, person.organization].filter(Boolean).join(" · ")}
                      </span>
                    </MenuItem>
                  ))}
                </MenuGroup>
                <MenuGroup heading="Deals">
                  {records.deals.map((deal) => (
                    <MenuItem
                      key={`deal-${deal.id}`}
                      value={`deal-${deal.id}`}
                      keywords={[deal.title, orgById.get(deal.organizationId)?.name ?? ""]}
                      onSelect={() => run(() => router.push(`/deals/${deal.id}`))}
                    >
                      <CircleDollarSign className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{deal.title}</span>
                      <span className="ml-auto truncate pl-3 text-xs tabular-nums text-muted-foreground">
                        {orgById.get(deal.organizationId)?.name} · {formatDealValue(deal.value)}
                      </span>
                    </MenuItem>
                  ))}
                </MenuGroup>
                <MenuGroup heading="Lists">
                  {records.collections.map((collection) => (
                    <MenuItem
                      key={`list-${collection.id}`}
                      value={`list-${collection.id}`}
                      keywords={[collection.name]}
                      onSelect={() => run(() => router.push(`/collections/${collection.id}`))}
                    >
                      <FolderKanban className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{collection.name}</span>
                    </MenuItem>
                  ))}
                </MenuGroup>
              </>
            )}

            <MenuGroup heading="Create">
              {CREATE_ACTIONS.map((action) => (
                <MenuItem
                  key={action.kind}
                  value={`create new add ${action.label}`}
                  onSelect={() => run(() => create(action.kind))}
                >
                  <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {action.label}
                </MenuItem>
              ))}
            </MenuGroup>

            <MenuGroup heading="Demo">
              <MenuItem
                value="reset demo data seed restore"
                onSelect={() =>
                  run(async () => {
                    const ok = await confirm({
                      title: "Reset demo data?",
                      description: "Companies, people, deals and activity go back to the seeded demo data.",
                      confirmLabel: "Reset data",
                    });
                    if (!ok) return;
                    resetDemoData();
                    window.location.assign("/?reset=1");
                  })
                }
              >
                <RotateCcw className="h-4 w-4 shrink-0 text-muted-foreground" />
                Reset demo data
              </MenuItem>
              <MenuItem
                value="demo bugs switches defects"
                onSelect={() => run(() => router.push("/settings#demo-bugs"))}
              >
                <Bug className="h-4 w-4 shrink-0 text-muted-foreground" />
                Demo bugs…
              </MenuItem>
            </MenuGroup>

            <MenuGroup heading="Go to">
              {NAV_SHORTCUTS.map((item) => (
                <MenuItem
                  key={item.href}
                  value={`go to navigate ${item.label}`}
                  onSelect={() => run(() => router.push(item.href))}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {item.label}
                  {item.key && (
                    <span className="ml-auto flex items-center gap-1">
                      <Kbd>G</Kbd>
                      <Kbd>{item.key.toUpperCase()}</Kbd>
                    </span>
                  )}
                </MenuItem>
              ))}
              <MenuItem
                value="go to navigate profile account"
                onSelect={() => run(() => router.push("/settings"))}
              >
                <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                Profile
              </MenuItem>
            </MenuGroup>
          </CommandPrimitive.List>
          <div className="flex items-center gap-4 border-t px-4 py-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              to select
            </span>
            <span className="ml-auto flex items-center gap-1.5">
              <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
              <Kbd>K</Kbd>
              to toggle
            </span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  );
}

function MenuGroup({ heading, children }: { heading: string; children: React.ReactNode }) {
  return (
    <CommandPrimitive.Group heading={heading} className="pb-1">
      {children}
    </CommandPrimitive.Group>
  );
}

function MenuItem({
  children,
  value,
  keywords,
  onSelect,
}: {
  children: React.ReactNode;
  value: string;
  keywords?: string[];
  onSelect: () => void;
}) {
  return (
    <CommandPrimitive.Item
      value={value}
      keywords={keywords}
      onSelect={onSelect}
      className="flex h-9 cursor-pointer select-none items-center gap-2.5 rounded-md px-2 text-sm text-foreground outline-none data-[selected=true]:bg-accent"
    >
      {children}
    </CommandPrimitive.Item>
  );
}
