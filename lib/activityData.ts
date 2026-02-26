import { Activity } from "@/types/activity";

const defaultActivities: Activity[] = [
  {
    id: "1",
    type: "organization_added",
    title: "New Organization Added",
    description: "Spotify was added to the pipeline",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userName: "Sarah Johnson",
  },
  {
    id: "2",
    type: "deal_moved",
    title: "Deal Stage Changed",
    description: "Figma moved from Screening to Hitlist",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    userName: "Michael Chen",
  },
  {
    id: "3",
    type: "person_added",
    title: "New Contact Added",
    description: "Daniel Ek added as contact for Spotify",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
  },
  {
    id: "4",
    type: "collection_created",
    title: "Collection Created",
    description: "New collection 'AI Startups' created",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
  },
  {
    id: "5",
    type: "meeting_scheduled",
    title: "Meeting Scheduled",
    description: "Due diligence call with Klarna scheduled for next week",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Sarah Johnson",
  },
];

export function getActivities(): Activity[] {
  if (typeof window === "undefined") return defaultActivities;
  
  const stored = localStorage.getItem("activities");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse activities:", e);
      return defaultActivities;
    }
  }
  
  localStorage.setItem("activities", JSON.stringify(defaultActivities));
  return defaultActivities;
}

export function saveActivities(activities: Activity[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("activities", JSON.stringify(activities));
}

export function addActivity(activity: Omit<Activity, "id" | "timestamp">): void {
  const activities = getActivities();
  const newActivity: Activity = {
    ...activity,
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
  };
  const updatedActivities = [newActivity, ...activities].slice(0, 100); // Keep last 100
  saveActivities(updatedActivities);
}

