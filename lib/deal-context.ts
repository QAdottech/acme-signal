import { getEmails } from "@/lib/emailData";
import { getActivities } from "@/lib/activityData";
import { getNotesForOrganization, type Note } from "@/lib/notesData";
import type { Deal } from "@/types/deal";
import type { EmailRecord } from "@/types/email";
import type { Activity } from "@/types/activity";

/**
 * Emails and activity that belong in a deal's timeline: anything sent to
 * the deal's company or its contacts, and the company's activity log.
 */
export function getDealContext(deal: Deal): { emails: EmailRecord[]; activities: Activity[] } {
  const contacts = new Set(deal.contactIds ?? []);
  return {
    emails: getEmails().filter(
      (email) =>
        email.relatedOrganizationId === deal.organizationId ||
        (!!email.relatedPersonId && contacts.has(email.relatedPersonId))
    ),
    activities: getActivities().filter(
      (activity) => activity.relatedEntityType === "organization" && activity.relatedEntityId === deal.organizationId
    ),
  };
}

/**
 * Notes shown on a deal: the company's general notes plus this deal's own,
 * but not notes written about the company's other deals.
 */
export function getDealNotes(deal: Deal): Note[] {
  return getNotesForOrganization(deal.organizationId).filter((note) => !note.dealId || note.dealId === deal.id);
}
