export type EmailStatus = "sent" | "delivered" | "failed";
export type EmailType = "verification" | "welcome" | "outreach" | "follow_up";

export interface EmailRecord {
  id: string;
  to: string;
  toName?: string;
  subject: string;
  body?: string;
  status: EmailStatus;
  type: EmailType;
  sentAt: string;
  relatedPersonId?: string;
  relatedOrganizationId?: string;
}
