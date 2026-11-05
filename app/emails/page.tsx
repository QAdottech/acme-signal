import { redirect } from "next/navigation";

/** Sent emails now live in the Inbox. Keeps ?new=email working for compose. */
export default function EmailsPage({ searchParams }: { searchParams: { new?: string } }) {
  redirect(searchParams.new === "email" ? "/inbox?view=emails&new=email" : "/inbox?view=emails");
}
