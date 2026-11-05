"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCheck,
  FolderPlus,
  Inbox,
  Mail,
  PenSquare,
  StickyNote,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { ComposeEmailModal } from "@/components/compose-email-modal";
import { getActivities, markAllAsRead, markAsRead } from "@/lib/activityData";
import { getEmails } from "@/lib/emailData";
import { getOrganizations } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { formatFullDate, formatRelative } from "@/lib/format";
import { useCreateIntent } from "@/lib/create-intent";
import type { Activity } from "@/types/activity";
import type { EmailRecord, EmailStatus, EmailType } from "@/types/email";
import { cn } from "@/lib/utils";

type View = "all" | "unread" | "emails";

type InboxItem =
  | { kind: "activity"; id: string; timestamp: string; unread: boolean; activity: Activity }
  | { kind: "email"; id: string; timestamp: string; unread: false; email: EmailRecord };

const ACTIVITY_ICONS: Record<Activity["type"], React.ComponentType<{ className?: string }>> = {
  stage_changed: ArrowRight,
  note_added: StickyNote,
  meeting_scheduled: Calendar,
  person_added: UserPlus,
  organization_added: Building2,
  collection_created: FolderPlus,
  deal_updated: TrendingUp,
  email_sent: Mail,
};

const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
  verification: "Verification",
  welcome: "Welcome",
  outreach: "Outreach",
  follow_up: "Follow up",
};

const EMAIL_STATUS_STYLES: Record<EmailStatus, string> = {
  sent: "bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
  delivered: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  failed: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
};

function initialView(): View {
  if (typeof window === "undefined") return "all";
  const view = new URLSearchParams(window.location.search).get("view");
  return view === "unread" || view === "emails" ? view : "all";
}

/**
 * One inbox for everything that happened: workspace notifications and the
 * emails the team sent. List on the left, the selected item on the right.
 */
export function InboxClient() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [view, setView] = useState<View>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Items read while in the Unread view stay listed until the view changes,
  // so the one you're reading doesn't vanish under you.
  const [readHere, setReadHere] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [orgNames, setOrgNames] = useState<Map<string, string>>(new Map());
  const [personIdsByEmail, setPersonIdsByEmail] = useState<Map<string, string>>(new Map());
  const listRef = useRef<HTMLDivElement>(null);
  useCreateIntent("email", () => setComposeOpen(true));

  const refresh = useCallback(() => {
    setActivities(getActivities());
    setEmails(getEmails());
  }, []);

  useEffect(() => {
    setView(initialView());
    refresh();
    setOrgNames(new Map(getOrganizations().map((org) => [org.id, org.name])));
    setPersonIdsByEmail(new Map(getPeople().map((p) => [p.email.toLowerCase(), p.id])));
  }, [refresh]);

  const items = useMemo<InboxItem[]>(() => {
    const activityItems: InboxItem[] = activities.map((activity) => ({
      kind: "activity",
      id: `activity-${activity.id}`,
      timestamp: activity.timestamp,
      unread: activity.read !== true,
      activity,
    }));
    const emailItems: InboxItem[] = emails.map((email) => ({
      kind: "email",
      id: `email-${email.id}`,
      timestamp: email.sentAt,
      unread: false,
      email,
    }));
    const all = [...activityItems, ...emailItems].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    if (view === "unread") return all.filter((item) => item.unread || readHere.has(item.id));
    if (view === "emails") return all.filter((item) => item.kind === "email");
    return all;
  }, [activities, emails, view, readHere]);

  const unreadCount = activities.filter((a) => a.read !== true).length;
  const selected = items.find((item) => item.id === selectedId) ?? null;

  const select = (item: InboxItem) => {
    setSelectedId(item.id);
    if (item.kind === "activity" && item.unread) {
      setReadHere((prev) => new Set(prev).add(item.id));
      markAsRead(item.activity.id);
      setActivities(getActivities());
    }
  };

  // ↑/↓ move through the list, like a mail client.
  const onListKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const index = items.findIndex((item) => item.id === selectedId);
    const next = items[Math.min(items.length - 1, Math.max(0, index + (event.key === "ArrowDown" ? 1 : -1)))];
    if (next) {
      select(next);
      listRef.current?.querySelector<HTMLElement>(`[data-id="${next.id}"]`)?.focus();
    }
  };

  return (
    <main className="flex h-full min-h-0">
      <section aria-label="Inbox items" className="flex w-[440px] shrink-0 flex-col border-r">
        <div className="px-5 pb-3 pt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Inbox</h1>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Mark all as read"
                  title="Mark all as read"
                  onClick={() => {
                    markAllAsRead();
                    setActivities(getActivities());
                    toast.success("All caught up");
                  }}
                >
                  <CheckCheck />
                </Button>
              )}
              <Button onClick={() => setComposeOpen(true)}>
                <PenSquare />
                Compose
              </Button>
            </div>
          </div>
          <SegmentedControl
            aria-label="Inbox view"
            value={view}
            onChange={(next) => {
              setView(next);
              setReadHere(new Set());
            }}
            className="w-full [&>button]:flex-1 [&>button]:justify-center"
            options={[
              { value: "all", label: "All" },
              { value: "unread", label: unreadCount > 0 ? `Unread (${unreadCount})` : "Unread" },
              { value: "emails", label: "Sent emails" },
            ]}
          />
        </div>

        <div
          ref={listRef}
          role="listbox"
          aria-label="Messages"
          onKeyDown={onListKeyDown}
          className="min-h-0 flex-1 overflow-y-auto border-t"
        >
          {items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center text-[13px] text-muted-foreground">
              <Inbox className="h-6 w-6" />
              {view === "unread" ? "No unread notifications." : "Nothing here yet."}
            </div>
          ) : (
            items.map((item) => (
              <InboxRow
                key={item.id}
                item={item}
                selected={item.id === selectedId}
                onSelect={() => select(item)}
              />
            ))
          )}
        </div>
      </section>

      <section aria-label="Message" className="min-w-0 flex-1 overflow-y-auto">
        {selected ? (
          <InboxDetail item={selected} orgNames={orgNames} personIdsByEmail={personIdsByEmail} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-[13px] text-muted-foreground">
            <Inbox className="h-8 w-8" />
            Select a notification or email to read it.
            <span className="text-xs">Use ↑ and ↓ to move through the list.</span>
          </div>
        )}
      </section>

      <ComposeEmailModal
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSent={() => {
          refresh();
          setView("emails");
        }}
      />
    </main>
  );
}

function InboxRow({ item, selected, onSelect }: { item: InboxItem; selected: boolean; onSelect: () => void }) {
  const Icon = item.kind === "email" ? Mail : ACTIVITY_ICONS[item.activity.type] ?? ArrowRight;
  const title = item.kind === "email" ? item.email.subject : item.activity.title;
  const meta =
    item.kind === "email"
      ? `To ${item.email.toName || item.email.to}`
      : [item.activity.userName, item.activity.description].filter(Boolean).join(" · ");
  return (
    <div
      role="option"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      data-id={item.id}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "relative flex cursor-pointer gap-3 border-b border-border/70 px-5 py-3 outline-none transition-colors focus-visible:bg-accent",
        selected ? "bg-accent" : "hover:bg-muted/50"
      )}
    >
      {item.unread && (
        <span aria-label="Unread" className="absolute left-2 top-[18px] h-1.5 w-1.5 rounded-full bg-blue-600" />
      )}
      <span
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          item.kind === "email"
            ? "bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300"
            : "bg-muted text-muted-foreground"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className={cn("truncate text-[13px]", item.unread ? "font-semibold" : "font-medium")}>{title}</span>
          <time dateTime={item.timestamp} className="shrink-0 text-xs text-muted-foreground">
            {formatRelative(item.timestamp)}
          </time>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{meta}</p>
      </div>
    </div>
  );
}

function InboxDetail({
  item,
  orgNames,
  personIdsByEmail,
}: {
  item: InboxItem;
  orgNames: Map<string, string>;
  personIdsByEmail: Map<string, string>;
}) {
  if (item.kind === "activity") {
    const { activity } = item;
    const Icon = ACTIVITY_ICONS[activity.type] ?? ArrowRight;
    const orgName =
      activity.relatedEntityType === "organization" && activity.relatedEntityId
        ? orgNames.get(activity.relatedEntityId)
        : undefined;
    return (
      <article className="mx-auto max-w-2xl px-10 py-10">
        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </span>
        <h2 className="text-xl font-semibold tracking-tight">{activity.title}</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {activity.userName && <>{activity.userName} · </>}
          <time dateTime={activity.timestamp} title={formatFullDate(activity.timestamp)}>
            {formatRelative(activity.timestamp)}
          </time>
        </p>
        <p className="mt-6 text-sm leading-relaxed">{activity.description}</p>
        {orgName && (
          <Button asChild variant="outline" className="mt-6">
            <Link href={`/organizations/${activity.relatedEntityId}`}>
              Open {orgName}
              <ArrowUpRight />
            </Link>
          </Button>
        )}
      </article>
    );
  }

  const { email } = item;
  const personId = personIdsByEmail.get(email.to.toLowerCase()) ?? email.relatedPersonId;
  const orgName = email.relatedOrganizationId ? orgNames.get(email.relatedOrganizationId) : undefined;
  return (
    <article className="mx-auto max-w-2xl px-10 py-10">
      <div className="mb-3 flex items-center gap-2">
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          {EMAIL_TYPE_LABELS[email.type]}
        </span>
        <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium capitalize", EMAIL_STATUS_STYLES[email.status])}>
          {email.status}
        </span>
      </div>
      <h2 className="text-xl font-semibold tracking-tight">{email.subject}</h2>
      <dl className="mt-3 grid grid-cols-[48px_1fr] gap-y-1 text-[13px]">
        <dt className="text-muted-foreground">To</dt>
        <dd>
          {personId ? (
            <Link href={`/people/${personId}`} className="font-medium underline-offset-2 hover:underline">
              {email.toName || email.to}
            </Link>
          ) : (
            <span className="font-medium">{email.toName || email.to}</span>
          )}
          {email.toName && <span className="text-muted-foreground"> &lt;{email.to}&gt;</span>}
        </dd>
        <dt className="text-muted-foreground">Sent</dt>
        <dd>{formatFullDate(email.sentAt)}</dd>
        {orgName && (
          <>
            <dt className="text-muted-foreground">About</dt>
            <dd>
              <Link href={`/organizations/${email.relatedOrganizationId}`} className="underline-offset-2 hover:underline">
                {orgName}
              </Link>
            </dd>
          </>
        )}
      </dl>
      <div className="mt-6 whitespace-pre-wrap rounded-lg border bg-background px-5 py-4 text-sm leading-relaxed">
        {email.body || <span className="text-muted-foreground">No message body.</span>}
      </div>
    </article>
  );
}
