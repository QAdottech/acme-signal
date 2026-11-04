import type { Note } from "@/lib/notesData";
import type { Task } from "@/types/task";
import type { EmailRecord } from "@/types/email";
import type { Activity } from "@/types/activity";

export type TimelineKind = "note" | "task" | "email" | "activity" | "created";

export interface TimelineItem {
  id: string;
  kind: TimelineKind;
  /** Short sentence: who did what. */
  title: string;
  /** Optional detail shown under the title (note text, email subject…). */
  body?: string;
  timestamp: string;
  /** Extra state, e.g. a completed task. */
  done?: boolean;
}

/**
 * Merge a record's notes, tasks, emails and activity log into one
 * newest-first feed, so every record page tells its story the same way.
 */
export function buildTimeline({
  notes = [],
  tasks = [],
  emails = [],
  activities = [],
  created,
}: {
  notes?: Note[];
  tasks?: Task[];
  emails?: EmailRecord[];
  activities?: Activity[];
  created?: { timestamp: string; title: string };
}): TimelineItem[] {
  const items: TimelineItem[] = [
    ...notes.map<TimelineItem>((note) => ({
      id: `note-${note.id}`,
      kind: "note",
      title: `${note.authorName} added a note`,
      body: note.content,
      timestamp: note.createdAt,
    })),
    ...tasks.map<TimelineItem>((task) => ({
      id: `task-${task.id}`,
      kind: "task",
      title: task.status === "done" ? `Task completed: ${task.title}` : `Task created: ${task.title}`,
      body: task.assignee ? `Assigned to ${task.assignee}` : undefined,
      timestamp: task.status === "done" && task.completedAt ? task.completedAt : task.createdAt,
      done: task.status === "done",
    })),
    ...emails.map<TimelineItem>((email) => ({
      id: `email-${email.id}`,
      kind: "email",
      title: `Email sent to ${email.toName || email.to}`,
      body: email.subject,
      timestamp: email.sentAt,
    })),
    ...activities.map<TimelineItem>((activity) => ({
      id: `activity-${activity.id}`,
      kind: "activity",
      title: activity.userName ? `${activity.userName} · ${activity.title}` : activity.title,
      body: activity.description,
      timestamp: activity.timestamp,
    })),
  ];
  if (created) {
    items.push({ id: "created", kind: "created", title: created.title, timestamp: created.timestamp });
  }
  return items
    .filter((item) => !Number.isNaN(new Date(item.timestamp).getTime()))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
