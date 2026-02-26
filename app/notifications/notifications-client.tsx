"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  StickyNote,
  Calendar,
  UserPlus,
  Building2,
  FolderPlus,
  TrendingUp,
  Mail,
  BellOff,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Activity } from "@/types/activity";
import {
  getActivities,
  markAsRead,
  markAllAsRead,
} from "@/lib/activityData";
import { cn } from "@/lib/utils";

type TimeGroup = "Today" | "Yesterday" | "This Week" | "Earlier";

type TypeFilter =
  | "all"
  | "stage_changed"
  | "note_added"
  | "meeting_scheduled"
  | "email_sent"
  | "person_added"
  | "organization_added"
  | "deal_updated"
  | "collection_created";

const typeFilterLabels: Record<TypeFilter, string> = {
  all: "All",
  stage_changed: "Stage Changes",
  note_added: "Notes",
  meeting_scheduled: "Meetings",
  email_sent: "Emails",
  person_added: "Contacts",
  organization_added: "Companies",
  deal_updated: "Deals",
  collection_created: "Lists",
};

function getTimeGroup(timestamp: string): TimeGroup {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Check if same calendar day
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return "Yesterday";
  if (diffDays <= 7) return "This Week";
  return "Earlier";
}

function getTimeAgo(timestamp: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getActivityIcon(type: Activity["type"]) {
  switch (type) {
    case "stage_changed":
      return { icon: ArrowRight, color: "text-orange-500", bg: "bg-orange-100 dark:bg-orange-500/20" };
    case "note_added":
      return { icon: StickyNote, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-500/20" };
    case "meeting_scheduled":
      return { icon: Calendar, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-500/20" };
    case "person_added":
      return { icon: UserPlus, color: "text-green-500", bg: "bg-green-100 dark:bg-green-500/20" };
    case "organization_added":
      return { icon: Building2, color: "text-cyan-500", bg: "bg-cyan-100 dark:bg-cyan-500/20" };
    case "collection_created":
      return { icon: FolderPlus, color: "text-indigo-500", bg: "bg-indigo-100 dark:bg-indigo-500/20" };
    case "deal_updated":
      return { icon: TrendingUp, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-500/20" };
    case "email_sent":
      return { icon: Mail, color: "text-teal-500", bg: "bg-teal-100 dark:bg-teal-500/20" };
    default:
      return { icon: ArrowRight, color: "text-gray-500", bg: "bg-gray-100 dark:bg-gray-500/20" };
  }
}

const timeGroupOrder: TimeGroup[] = ["Today", "Yesterday", "This Week", "Earlier"];

export function NotificationsClient() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [readFilter, setReadFilter] = useState<"all" | "unread">("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  useEffect(() => {
    setActivities(getActivities());
  }, []);

  const filteredActivities = useMemo(() => {
    let filtered = activities;
    if (readFilter === "unread") {
      filtered = filtered.filter((a) => a.read !== true);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }
    return filtered;
  }, [activities, readFilter, typeFilter]);

  const groupedActivities = useMemo(() => {
    const groups: Record<TimeGroup, Activity[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: [],
    };
    for (const activity of filteredActivities) {
      const group = getTimeGroup(activity.timestamp);
      groups[group].push(activity);
    }
    return groups;
  }, [filteredActivities]);

  const unreadCount = useMemo(
    () => activities.filter((a) => a.read !== true).length,
    [activities]
  );

  const handleMarkAsRead = useCallback(
    (id: string) => {
      markAsRead(id);
      setActivities(getActivities());
    },
    []
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead();
    setActivities(getActivities());
  }, []);

  const handleNotificationClick = useCallback(
    (activity: Activity) => {
      if (activity.read !== true) {
        handleMarkAsRead(activity.id);
      }
      if (activity.relatedEntityId && activity.relatedEntityType === "organization") {
        router.push(`/organizations/${activity.relatedEntityId}`);
      }
    },
    [handleMarkAsRead, router]
  );

  const hasActivities = filteredActivities.length > 0;

  return (
    <main className="container py-8 max-w-[900px] mx-auto px-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {/* Read filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setReadFilter("all")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              readFilter === "all"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            All
          </button>
          <button
            onClick={() => setReadFilter("unread")}
            className={cn(
              "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              readFilter === "unread"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1.5 bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center inline-block">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Type filter */}
        <div className="ml-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            {Object.entries(typeFilterLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notification list */}
      {hasActivities ? (
        <div className="space-y-6">
          {timeGroupOrder.map((group) => {
            const groupActivities = groupedActivities[group];
            if (groupActivities.length === 0) return null;

            return (
              <div key={group}>
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
                  {group}
                </h2>
                <div className="space-y-0.5">
                  {groupActivities.map((activity) => {
                    const { icon: Icon, color, bg } = getActivityIcon(activity.type);
                    const isUnread = activity.read !== true;

                    return (
                      <button
                        key={activity.id}
                        onClick={() => handleNotificationClick(activity)}
                        className={cn(
                          "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                          "hover:bg-gray-100 dark:hover:bg-gray-800/60",
                          isUnread
                            ? "bg-orange-50/50 dark:bg-orange-500/5"
                            : ""
                        )}
                      >
                        {/* Icon */}
                        <div
                          className={cn(
                            "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0",
                            bg
                          )}
                        >
                          <Icon className={cn("w-4 h-4", color)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-sm text-gray-900 dark:text-white",
                              isUnread ? "font-semibold" : "font-normal"
                            )}
                          >
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            {activity.userName && (
                              <span>{activity.userName} &middot; </span>
                            )}
                            {getTimeAgo(activity.timestamp)}
                          </p>
                        </div>

                        {/* Unread indicator */}
                        {isUnread && (
                          <div className="flex-shrink-0 mt-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <BellOff className="w-7 h-7 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No notifications
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
            {readFilter === "unread"
              ? "You're all caught up! No unread notifications."
              : "No notifications to show for the selected filter."}
          </p>
        </div>
      )}
    </main>
  );
}
