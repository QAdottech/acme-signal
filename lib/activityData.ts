import { Activity } from "@/types/activity";

const defaultActivities: Activity[] = [
  {
    id: "16",
    type: "email_sent",
    title: "Email Sent",
    description: "Proposal sent to Anthropic team",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    relatedEntityId: "12",
    relatedEntityType: "organization",
  },
  {
    id: "1",
    type: "stage_changed",
    title: "Deal Stage Updated",
    description: "Cursor deal moved to Negotiation",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    relatedEntityId: "23",
    relatedEntityType: "organization",
  },
  {
    id: "2",
    type: "note_added",
    title: "Note Added",
    description: "Added note on Anthropic proposal timeline",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
    relatedEntityId: "12",
    relatedEntityType: "organization",
  },
  {
    id: "17",
    type: "deal_updated",
    title: "Deal Updated",
    description: "Cursor deal value updated to $180,000",
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
    relatedEntityId: "23",
    relatedEntityType: "organization",
  },
  {
    id: "3",
    type: "meeting_scheduled",
    title: "Meeting Scheduled",
    description: "Demo call with Perplexity scheduled for Thursday",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
    relatedEntityId: "24",
    relatedEntityType: "organization",
  },
  {
    id: "18",
    type: "meeting_scheduled",
    title: "Meeting Scheduled",
    description: "Onboarding call with lovable.dev team",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    userName: "Sarah Johnson",
    relatedEntityId: "25",
    relatedEntityType: "organization",
  },
  {
    id: "4",
    type: "person_added",
    title: "New Contact Added",
    description: "Aravind Srinivas added as contact for Perplexity",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    userName: "Sarah Johnson",
    relatedEntityId: "24",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "19",
    type: "email_sent",
    title: "Email Sent",
    description: "Follow-up sent to Vercel partnership team",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    relatedEntityId: "4",
    relatedEntityType: "organization",
  },
  {
    id: "5",
    type: "stage_changed",
    title: "Deal Stage Updated",
    description: "Anthropic deal moved to Proposal",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
    relatedEntityId: "12",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "6",
    type: "organization_added",
    title: "New Company Added",
    description: "Listen Labs added to the CRM",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    userName: "Sarah Johnson",
    relatedEntityId: "25",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "20",
    type: "stage_changed",
    title: "Deal Stage Updated",
    description: "Sana Labs deal moved to Qualified",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Michael Chen",
    relatedEntityId: "15",
    relatedEntityType: "organization",
  },
  {
    id: "7",
    type: "meeting_scheduled",
    title: "Meeting Scheduled",
    description: "Technical deep-dive with Klarna analytics team",
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Michael Chen",
    relatedEntityId: "8",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "21",
    type: "note_added",
    title: "Note Added",
    description: "Competitive analysis updated for Wolt evaluation",
    timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    relatedEntityId: "10",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "8",
    type: "note_added",
    title: "Note Added",
    description: "Updated notes on Vercel partnership roadmap",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    relatedEntityId: "4",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "9",
    type: "stage_changed",
    title: "Deal Stage Updated",
    description: "Vercel deal moved to Qualified",
    timestamp: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
    relatedEntityId: "4",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "10",
    type: "collection_created",
    title: "List Created",
    description: "New list 'Developer Tools' created with 4 companies",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    read: true,
  },
  {
    id: "22",
    type: "person_added",
    title: "New Contact Added",
    description: "Lisa Berglund added as contact for Peakon",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Sarah Johnson",
    relatedEntityId: "11",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "11",
    type: "person_added",
    title: "New Contact Added",
    description: "Michael Truell added as contact for Cursor",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    relatedEntityId: "23",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "12",
    type: "organization_added",
    title: "New Company Added",
    description: "Atlar added to the CRM",
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
    relatedEntityId: "20",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "13",
    type: "meeting_scheduled",
    title: "Meeting Scheduled",
    description: "Quarterly review with Spotify account team",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Sarah Johnson",
    relatedEntityId: "1",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "14",
    type: "note_added",
    title: "Note Added",
    description: "Competitive analysis note added for QA.tech evaluation",
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "Emma Wilson",
    relatedEntityId: "3",
    relatedEntityType: "organization",
    read: true,
  },
  {
    id: "15",
    type: "stage_changed",
    title: "Deal Stage Updated",
    description: "Hugging Face deal moved to Qualified",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    userName: "David Martinez",
    relatedEntityId: "16",
    relatedEntityType: "organization",
    read: true,
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

export function getUnreadCount(): number {
  const activities = getActivities();
  return activities.filter((a) => a.read !== true).length;
}

export function markAsRead(id: string): void {
  const activities = getActivities();
  const updated = activities.map((a) =>
    a.id === id ? { ...a, read: true } : a
  );
  saveActivities(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications-updated"));
  }
}

export function markAllAsRead(): void {
  const activities = getActivities();
  const updated = activities.map((a) => ({ ...a, read: true }));
  saveActivities(updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications-updated"));
  }
}
