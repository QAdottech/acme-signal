import { Activity } from "@/types/activity";
import { getSupabase, newId, throwIfError } from "@/lib/supabase";

interface ActivityRow {
  id: string;
  type: Activity["type"];
  title: string;
  description: string;
  timestamp: string;
  user_id: string | null;
  user_name: string | null;
  related_entity_id: string | null;
  related_entity_type: Activity["relatedEntityType"] | null;
  read: boolean;
}

function mapActivity(row: ActivityRow): Activity {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    timestamp: row.timestamp,
    userId: row.user_id ?? undefined,
    userName: row.user_name ?? undefined,
    relatedEntityId: row.related_entity_id ?? undefined,
    relatedEntityType: row.related_entity_type ?? undefined,
    read: row.read,
  };
}

function toRow(activity: Activity): ActivityRow {
  return {
    id: activity.id,
    type: activity.type,
    title: activity.title,
    description: activity.description,
    timestamp: activity.timestamp,
    user_id: activity.userId ?? null,
    user_name: activity.userName ?? null,
    related_entity_id: activity.relatedEntityId ?? null,
    related_entity_type: activity.relatedEntityType ?? null,
    read: activity.read === true,
  };
}

function notify() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("notifications-updated"));
  }
}

export async function getActivities(): Promise<Activity[]> {
  const { data, error } = await getSupabase()
    .from("activities")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(100);
  throwIfError(error, "getActivities");
  return ((data ?? []) as ActivityRow[]).map(mapActivity);
}

export async function saveActivities(activities: Activity[]): Promise<void> {
  const existing = await getActivities();
  const nextIds = new Set(activities.map((activity) => activity.id));
  const toDelete = existing
    .filter((activity) => !nextIds.has(activity.id))
    .map((activity) => activity.id);
  if (toDelete.length > 0) {
    const { error } = await getSupabase()
      .from("activities")
      .delete()
      .in("id", toDelete);
    throwIfError(error, "saveActivities.delete");
  }
  if (activities.length === 0) return;
  const { error } = await getSupabase()
    .from("activities")
    .upsert(activities.map(toRow));
  throwIfError(error, "saveActivities");
  notify();
}

export async function addActivity(
  activity: Omit<Activity, "id" | "timestamp">
): Promise<void> {
  const created: Activity = {
    ...activity,
    id: newId(),
    timestamp: new Date().toISOString(),
  };
  const { error } = await getSupabase().from("activities").insert(toRow(created));
  throwIfError(error, "addActivity");
  notify();
}

export async function getUnreadCount(): Promise<number> {
  const { count, error } = await getSupabase()
    .from("activities")
    .select("*", { count: "exact", head: true })
    .eq("read", false);
  throwIfError(error, "getUnreadCount");
  return count ?? 0;
}

export async function markAsRead(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("activities")
    .update({ read: true })
    .eq("id", id);
  throwIfError(error, "markAsRead");
  notify();
}

export async function markAllAsRead(): Promise<void> {
  const { error } = await getSupabase()
    .from("activities")
    .update({ read: true })
    .eq("read", false);
  throwIfError(error, "markAllAsRead");
  notify();
}
