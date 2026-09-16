import type { EmailRecord } from "@/types/email";
import { getSupabase, newId, throwIfError } from "@/lib/supabase";

interface EmailRow {
  id: string;
  to_email: string;
  to_name: string | null;
  subject: string;
  body: string | null;
  status: EmailRecord["status"];
  type: EmailRecord["type"];
  sent_at: string;
  related_person_id: string | null;
  related_organization_id: string | null;
}

function mapEmail(row: EmailRow): EmailRecord {
  return {
    id: row.id,
    to: row.to_email,
    toName: row.to_name ?? undefined,
    subject: row.subject,
    body: row.body ?? undefined,
    status: row.status,
    type: row.type,
    sentAt: row.sent_at,
    relatedPersonId: row.related_person_id ?? undefined,
    relatedOrganizationId: row.related_organization_id ?? undefined,
  };
}

function toRow(email: EmailRecord): EmailRow {
  return {
    id: email.id,
    to_email: email.to,
    to_name: email.toName ?? null,
    subject: email.subject,
    body: email.body ?? null,
    status: email.status,
    type: email.type,
    sent_at: email.sentAt,
    related_person_id: email.relatedPersonId ?? null,
    related_organization_id: email.relatedOrganizationId ?? null,
  };
}

export async function getEmails(): Promise<EmailRecord[]> {
  const { data, error } = await getSupabase()
    .from("emails")
    .select("*")
    .order("sent_at", { ascending: false });
  throwIfError(error, "getEmails");
  return ((data ?? []) as EmailRow[]).map(mapEmail);
}

export async function saveEmails(emails: EmailRecord[]): Promise<void> {
  const existing = await getEmails();
  const nextIds = new Set(emails.map((email) => email.id));
  const toDelete = existing
    .filter((email) => !nextIds.has(email.id))
    .map((email) => email.id);
  if (toDelete.length > 0) {
    const { error } = await getSupabase().from("emails").delete().in("id", toDelete);
    throwIfError(error, "saveEmails.delete");
  }
  if (emails.length === 0) return;
  const { error } = await getSupabase().from("emails").upsert(emails.map(toRow));
  throwIfError(error, "saveEmails");
}

export async function addEmail(
  email: Omit<EmailRecord, "id">
): Promise<EmailRecord> {
  const created: EmailRecord = {
    ...email,
    id: "em" + newId(),
  };
  const { error } = await getSupabase().from("emails").insert(toRow(created));
  throwIfError(error, "addEmail");
  return created;
}

export async function getEmailsForPerson(
  personId: string
): Promise<EmailRecord[]> {
  const { data, error } = await getSupabase()
    .from("emails")
    .select("*")
    .eq("related_person_id", personId)
    .order("sent_at", { ascending: false });
  throwIfError(error, "getEmailsForPerson");
  return ((data ?? []) as EmailRow[]).map(mapEmail);
}

export async function getEmailsForOrganization(
  organizationId: string
): Promise<EmailRecord[]> {
  const { data, error } = await getSupabase()
    .from("emails")
    .select("*")
    .eq("related_organization_id", organizationId)
    .order("sent_at", { ascending: false });
  throwIfError(error, "getEmailsForOrganization");
  return ((data ?? []) as EmailRow[]).map(mapEmail);
}
