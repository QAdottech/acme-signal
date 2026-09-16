"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Building2,
  CheckSquare,
  ChevronDown,
  Columns3,
  Inbox,
  ListTodo,
  LogOut,
  Mail,
  Plus,
  Search,
  Settings,
  SquareStack,
  StickyNote,
  Users,
  UsersRound,
  FileBarChart,
  Bell,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { getCollections, saveCollections } from "@/lib/organizationData";
import { getUnreadCount } from "@/lib/activityData";
import { getOpenTaskCount } from "@/lib/taskData";
import { useEffect, useState } from "react";
import type { Collection } from "@/types/organization";
import { cn } from "@/lib/utils";
import { SignalLogo } from "@/components/signal-logo";
import { getInitials, getAvatarColor, PIPELINE_VIEWS } from "@/lib/pipeline";
import { AddCollectionModal } from "@/components/add-collection-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const mainNavItems = [
  { href: "/", label: "Pipeline", icon: Columns3 },
  { href: "/deals", label: "Deals", icon: SquareStack },
  { href: "/organizations", label: "Companies", icon: Building2 },
  { href: "/people", label: "People", icon: Users },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/emails", label: "Inbox", icon: Inbox },
];

interface SidebarProps {
  onSearch: () => void;
}

export function Sidebar({ onSearch }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout, isAdmin } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openTaskCount, setOpenTaskCount] = useState(0);
  const [isAddViewOpen, setIsAddViewOpen] = useState(false);

  const activeView = searchParams?.get("view");

  useEffect(() => {
    setCollections(getCollections());
    setUnreadCount(getUnreadCount());
    setOpenTaskCount(getOpenTaskCount());

    const handleNotificationsUpdate = () => setUnreadCount(getUnreadCount());
    const handleCollectionsUpdate = () => setCollections(getCollections());
    const handleTasksUpdate = () => setOpenTaskCount(getOpenTaskCount());
    window.addEventListener("notifications-updated", handleNotificationsUpdate);
    window.addEventListener("collections-updated", handleCollectionsUpdate);
    window.addEventListener("tasks-updated", handleTasksUpdate);
    return () => {
      window.removeEventListener("notifications-updated", handleNotificationsUpdate);
      window.removeEventListener("collections-updated", handleCollectionsUpdate);
      window.removeEventListener("tasks-updated", handleTasksUpdate);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/" && !activeView;
    return pathname?.startsWith(href);
  };

  const handleAddCollection = (
    newCollection: Omit<Collection, "id" | "organizationIds">
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const updated = [...collections, { ...newCollection, id, organizationIds: [] }];
    setCollections(updated);
    saveCollections(updated);
    setIsAddViewOpen(false);
    window.dispatchEvent(new Event("collections-updated"));
  };

  return (
    <aside className="w-[244px] h-screen sticky top-0 flex flex-col border-r border-neutral-200 bg-[#F7F7F5]">
      <div className="px-3 pt-3 pb-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-2.5 rounded-lg px-1.5 py-1.5 hover:bg-black/5 transition-colors text-left">
              <SignalLogo className="w-7 h-7 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold text-neutral-900 leading-tight truncate">
                  ACME Signal
                </span>
                <span className="block text-[11px] text-neutral-500 leading-tight truncate">
                  Nordics workspace
                </span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem disabled className="text-xs text-neutral-500">
              Nordics workspace
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="px-3 pb-3">
        <button
          onClick={onSearch}
          className="w-full h-8 flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-2.5 text-[13px] text-neutral-400 hover:border-neutral-300 transition-colors"
        >
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="flex-1 text-left">Search</span>
          <kbd className="text-[10px] text-neutral-400 font-medium tracking-wide">
            ⌘K
          </kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        <div className="space-y-0.5">
          {mainNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-[13px] font-medium transition-colors",
                isActive(item.href)
                  ? "bg-neutral-200/80 text-neutral-900"
                  : "text-neutral-600 hover:bg-black/5 hover:text-neutral-900"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.href === "/tasks" && openTaskCount > 0 && (
                <span className="bg-[#E24B26] text-white text-[10px] font-semibold rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center">
                  {openTaskCount}
                </span>
              )}
              {item.href === "/emails" && unreadCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          ))}
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between px-2.5 mb-1">
            <span className="text-[11px] font-medium text-neutral-400">
              Views
            </span>
            <button
              onClick={() => setIsAddViewOpen(true)}
              className="w-5 h-5 flex items-center justify-center rounded text-neutral-400 hover:text-neutral-700 hover:bg-black/5"
              aria-label="Add view"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {PIPELINE_VIEWS.map((view) => (
              <Link
                key={view.id}
                href={view.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-[13px] transition-colors",
                  pathname === "/" && activeView === view.id
                    ? "bg-neutral-200/80 text-neutral-900 font-medium"
                    : "text-neutral-600 hover:bg-black/5 hover:text-neutral-900"
                )}
              >
                <span
                  className={cn(
                    "w-2 h-2 shrink-0",
                    view.color,
                    view.shape === "circle" ? "rounded-full" : "rounded-[2px]"
                  )}
                />
                <span className="truncate">{view.name}</span>
              </Link>
            ))}
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 h-8 rounded-lg text-[13px] transition-colors",
                  pathname === `/collections/${collection.id}`
                    ? "bg-neutral-200/80 text-neutral-900 font-medium"
                    : "text-neutral-600 hover:bg-black/5 hover:text-neutral-900"
                )}
              >
                <ListTodo className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <span className="truncate">{collection.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="px-2 pb-3">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-black/5 transition-colors text-left">
                <div
                  className={cn(
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0",
                    user.avatar ? "" : getAvatarColor(user.fullName || user.email)
                  )}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(user.fullName || user.email || "U")
                  )}
                </div>
                <span className="flex-1 min-w-0 text-[13px] font-medium text-neutral-800 truncate">
                  {user.fullName || user.email}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0 rotate-[-90deg]" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top" className="w-56 mb-1">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium leading-none">{user.fullName}</p>
                <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile/edit">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/team">
                    <UsersRound className="w-4 h-4 mr-2" />
                    Team
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/reports">
                  <FileBarChart className="w-4 h-4 mr-2" />
                  Reports
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notes">
                  <StickyNote className="w-4 h-4 mr-2" />
                  Notes
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/notifications">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                  {unreadCount > 0 && (
                    <span className="ml-auto text-xs text-neutral-500">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/emails">
                  <Mail className="w-4 h-4 mr-2" />
                  Emails
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <AddCollectionModal
        isOpen={isAddViewOpen}
        onClose={() => setIsAddViewOpen(false)}
        onAdd={handleAddCollection}
      />
    </aside>
  );
}
