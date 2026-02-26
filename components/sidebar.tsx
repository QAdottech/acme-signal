"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileBarChart,
  BarChart3,
  Bell,
  Building2,
  Users,
  FolderKanban,
  Kanban,
  Settings,
  UsersRound,
  CircleDollarSign,
  CheckSquare,
  StickyNote,
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { getCollections } from "@/lib/organizationData";
import { getUnreadCount } from "@/lib/activityData";
import { useEffect, useState } from "react";
import type { Collection } from "@/types/organization";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { href: "/", label: "Pipeline", icon: Kanban },
  { href: "/deals", label: "Deals", icon: CircleDollarSign },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/organizations", label: "Companies", icon: Building2 },
  { href: "/people", label: "People", icon: Users },
  { href: "/notes", label: "Notes", icon: StickyNote },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isAdmin } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setCollections(getCollections());
    setUnreadCount(getUnreadCount());

    const handleUpdate = () => setUnreadCount(getUnreadCount());
    window.addEventListener("notifications-updated", handleUpdate);
    return () => window.removeEventListener("notifications-updated", handleUpdate);
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  return (
    <aside className="w-60 h-screen sticky top-0 flex flex-col border-r bg-gray-50/80 dark:bg-gray-900">
      {/* Workspace header */}
      <div className="h-14 flex items-center px-4 border-b">
        <Link href="/" className="flex items-center">
          <Image
            src="/logos/acme-full-logo.png"
            alt="ACME Signal"
            width={240}
            height={68}
            className="dark:invert"
          />
        </Link>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-3">
        <div className="space-y-0.5">
          {mainNavItems.map((item, index) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-gray-200/80 dark:bg-gray-800 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </Link>
              {index === 0 && (
                <Link
                  href="/notifications"
                  className={cn(
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                    isActive("/notifications")
                      ? "bg-gray-200/80 dark:bg-gray-800 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span className="flex items-center gap-2">
                    Notifications
                    {unreadCount > 0 && (
                      <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
                        {unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Lists / Collections */}
        <div className="mt-6">
          <div className="flex items-center justify-between px-2.5 mb-1">
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Lists
            </span>
          </div>
          <div className="space-y-0.5">
            {collections.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.id}`}
                className={cn(
                  "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                  isActive(`/collections/${collection.id}`)
                    ? "bg-gray-200/80 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <FolderKanban className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{collection.name}</span>
              </Link>
            ))}
            <Link
              href="/collections"
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm transition-colors",
                pathname === "/collections"
                  ? "bg-gray-200/80 dark:bg-gray-800 text-gray-900 dark:text-white font-medium"
                  : "text-gray-500 dark:text-gray-500 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
              )}
            >
              <span className="w-4 h-4 flex items-center justify-center text-xs">+</span>
              All Lists
            </Link>
          </div>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t px-2 py-3 space-y-0.5">
        {isAdmin && (
          <Link
            href="/team"
            className={cn(
              "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive("/team")
                ? "bg-gray-200/80 dark:bg-gray-800 text-gray-900 dark:text-white"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            <UsersRound className="w-4 h-4 flex-shrink-0" />
            Team
          </Link>
        )}
        <Link
          href="/profile/edit"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors",
            isActive("/profile")
              ? "bg-gray-200/80 dark:bg-gray-800 text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
