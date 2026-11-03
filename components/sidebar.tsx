"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  CheckSquare,
  ChevronsUpDown,
  CircleDollarSign,
  FileBarChart,
  Kanban,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  StickyNote,
  User,
  Users,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCollections } from "@/lib/organizationData";
import { getUnreadCount } from "@/lib/activityData";
import { getTasks, isDueSoon } from "@/lib/taskData";
import { dispatchCreateIntent } from "@/lib/create-intent";
import { openCommandMenu, Kbd } from "@/components/command-menu";
import { HelpPopover } from "@/components/help-popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Collection } from "@/types/organization";
import { cn } from "@/lib/utils";

type NavEntry = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const RECORDS: NavEntry[] = [
  { href: "/organizations", label: "Companies", icon: Building2 },
  { href: "/people", label: "People", icon: Users },
  { href: "/deals", label: "Deals", icon: CircleDollarSign },
];

const WORKSPACE: NavEntry[] = [
  { href: "/", label: "Pipeline", icon: Kanban },
  { href: "/emails", label: "Emails", icon: Mail },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/reports", label: "Reports", icon: FileBarChart },
];

/** Stable colour per list, so each list keeps its swatch across renders. */
const LIST_SWATCHES = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

function swatchFor(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return LIST_SWATCHES[hash % LIST_SWATCHES.length];
}

function countOpenTasksDue(): number {
  const today = new Date().toISOString().split("T")[0];
  return getTasks().filter(
    (task) =>
      task.status !== "done" &&
      !!task.dueDate &&
      (task.dueDate < today || isDueSoon(task))
  ).length;
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dueTaskCount, setDueTaskCount] = useState(0);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  // Counts are re-read on navigation and whenever the data changes.
  useEffect(() => {
    const refreshNotifications = () => setUnreadCount(getUnreadCount());
    const refreshCollections = () => setCollections(getCollections());
    const refreshTasks = () => setDueTaskCount(countOpenTasksDue());
    refreshNotifications();
    refreshCollections();
    refreshTasks();
    window.addEventListener("notifications-updated", refreshNotifications);
    window.addEventListener("collections-updated", refreshCollections);
    window.addEventListener("tasks-updated", refreshTasks);
    return () => {
      window.removeEventListener("notifications-updated", refreshNotifications);
      window.removeEventListener("collections-updated", refreshCollections);
      window.removeEventListener("tasks-updated", refreshTasks);
    };
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : !!pathname?.startsWith(href);

  const createList = () => {
    if (pathname === "/collections") dispatchCreateIntent("list");
    else router.push("/collections?new=list");
  };

  return (
    <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r bg-sidebar">
      {/* Workspace + account */}
      <div className="px-2 pt-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Account menu"
              className="flex h-10 w-full items-center gap-2 rounded-md px-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 data-[state=open]:bg-accent"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-foreground">
                <Image
                  src="/logos/acme-icon.png"
                  alt=""
                  width={16}
                  height={16}
                  className="invert dark:invert-0"
                />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold leading-4">
                  ACME Signal
                </span>
                {user && (
                  <span className="block truncate text-xs leading-4 text-muted-foreground">
                    {user.fullName}
                  </span>
                )}
              </span>
              <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            {user && (
              <DropdownMenuLabel className="font-normal">
                <p className="truncate text-[13px] font-medium">{user.fullName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile/edit">
                <User />
                Profile settings
              </Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild>
                <Link href="/team">
                  <UsersRound />
                  Manage team
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Search */}
      <div className="px-2 pb-1 pt-2">
        <button
          type="button"
          onClick={openCommandMenu}
          aria-label="Search"
          aria-keyshortcuts="Meta+K Control+K"
          className="flex h-8 w-full items-center gap-2 rounded-md border border-input bg-background px-2 text-[13px] text-muted-foreground shadow-sm transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
        >
          <Search className="h-4 w-4" />
          Search
          <span className="ml-auto flex items-center gap-0.5">
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </span>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3" aria-label="Main">
        <NavSection>
          <NavLink href="/notifications" label="Notifications" icon={Bell} active={isActive("/notifications")}>
            {unreadCount > 0 && (
              <span className="ml-auto min-w-[18px] rounded-full bg-blue-600 px-1.5 text-center text-[11px] font-medium leading-4 text-white">
                {unreadCount}
              </span>
            )}
          </NavLink>
          <NavLink href="/tasks" label="Tasks" icon={CheckSquare} active={isActive("/tasks")}>
            {dueTaskCount > 0 && (
              <span
                aria-hidden
                className="ml-auto text-xs tabular-nums text-muted-foreground"
                title="Open tasks overdue or due in the next 7 days"
              >
                {dueTaskCount}
              </span>
            )}
          </NavLink>
        </NavSection>

        <NavSection title="Records">
          {RECORDS.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </NavSection>

        <NavSection title="Workspace">
          {WORKSPACE.map((item) => (
            <NavLink key={item.href} {...item} active={isActive(item.href)} />
          ))}
        </NavSection>

        <NavSection
          title="Lists"
          titleHref="/collections"
          action={
            <button
              type="button"
              onClick={createList}
              aria-label="New list"
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground opacity-0 transition hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover/section:opacity-100"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          }
        >
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.id}`}
              className={navItemClass(isActive(`/collections/${collection.id}`))}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                <span className={cn("h-2.5 w-2.5 rounded-[3px]", swatchFor(collection.id))} />
              </span>
              <span className="truncate">{collection.name}</span>
            </Link>
          ))}
          {collections.length === 0 && (
            <p className="px-2 py-1 text-xs text-muted-foreground">No lists yet</p>
          )}
        </NavSection>
      </nav>

      <div className="space-y-px border-t px-2 py-2">
        <HelpPopover />
        {isAdmin && (
          <NavLink href="/team" label="Team" icon={UsersRound} active={isActive("/team")} />
        )}
        <NavLink href="/profile/edit" label="Settings" icon={Settings} active={isActive("/profile")} />
      </div>
    </aside>
  );
}

export function navItemClass(active: boolean) {
  return cn(
    "flex h-8 items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-colors",
    "[&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
    active
      ? "bg-accent text-foreground [&_svg]:text-foreground"
      : "text-gray-600 hover:bg-accent/70 hover:text-foreground dark:text-gray-400 [&_svg]:text-muted-foreground"
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  children,
}: NavEntry & { active: boolean; children?: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={navItemClass(active)}
    >
      <Icon />
      <span className="truncate">{label}</span>
      {children}
    </Link>
  );
}

function NavSection({
  title,
  titleHref,
  action,
  children,
}: {
  title?: string;
  titleHref?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group/section mt-4 first:mt-2">
      {title && (
        <div className="mb-0.5 flex h-6 items-center justify-between px-2">
          {titleHref ? (
            <Link
              href={titleHref}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {title}
            </Link>
          ) : (
            <span className="text-xs font-medium text-muted-foreground">{title}</span>
          )}
          {action}
        </div>
      )}
      <div className="space-y-px">{children}</div>
    </div>
  );
}
