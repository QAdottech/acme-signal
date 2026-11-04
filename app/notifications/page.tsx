import { redirect } from "next/navigation";

/** Notifications now live in the Inbox. */
export default function NotificationsPage() {
  redirect("/inbox");
}
