"use client";

import { Activity } from "@/types/activity";
import { Building2, Users, FolderKanban, ArrowRight, StickyNote, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const activityIcons = {
  organization_added: Building2,
  person_added: Users,
  collection_created: FolderKanban,
  deal_moved: ArrowRight,
  note_added: StickyNote,
  meeting_scheduled: Calendar,
};

const activityColors = {
  organization_added: "text-blue-500 bg-blue-50 dark:bg-blue-950",
  person_added: "text-green-500 bg-green-50 dark:bg-green-950",
  collection_created: "text-purple-500 bg-purple-50 dark:bg-purple-950",
  deal_moved: "text-orange-500 bg-orange-50 dark:bg-orange-950",
  note_added: "text-yellow-500 bg-yellow-50 dark:bg-yellow-950",
  meeting_scheduled: "text-pink-500 bg-pink-50 dark:bg-pink-950",
};

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const displayedActivities = activities.slice(0, maxItems);

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedActivities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {activity.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-xs text-gray-400">
                      {getTimeAgo(activity.timestamp)}
                    </p>
                    {activity.userName && (
                      <>
                        <span className="text-xs text-gray-300">•</span>
                        <p className="text-xs text-gray-400">{activity.userName}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

