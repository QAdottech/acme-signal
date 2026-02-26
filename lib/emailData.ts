import type { EmailRecord } from "@/types/email";

const defaultEmails: EmailRecord[] = [
  {
    id: "em1",
    to: "prj-anip7v@qatech.email",
    subject: "Verify your email - ACME Signal",
    body: "Please click the link below to verify your email address and complete your registration.",
    status: "sent",
    type: "verification",
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: "em2",
    to: "james.morrison@example.com",
    toName: "James Morrison",
    subject: "Welcome to ACME Signal!",
    body: "Hi James,\n\nWelcome to ACME Signal! We're excited to have you on board. Here's a quick guide to get you started...",
    status: "delivered",
    type: "welcome",
    sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: "em3",
    to: "daniel@spotify.com",
    toName: "Daniel Ek",
    subject: "Re: Partnership Discussion",
    body: "Hi Daniel,\n\nThank you for taking the time to discuss a potential partnership. I wanted to follow up on the key points we covered...",
    status: "delivered",
    type: "outreach",
    sentAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    relatedPersonId: "1",
    relatedOrganizationId: "1",
  },
  {
    id: "em4",
    to: "michael@cursor.sh",
    toName: "Michael Truell",
    subject: "Technical Requirements Follow-up",
    body: "Hi Michael,\n\nFollowing our conversation about the technical requirements, I've put together a document outlining the integration specs...",
    status: "delivered",
    type: "follow_up",
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    relatedPersonId: "12",
    relatedOrganizationId: "23",
  },
  {
    id: "em5",
    to: "dario@anthropic.com",
    toName: "Dario Amodei",
    subject: "Proposal: Enterprise License",
    body: "Hi Dario,\n\nAs discussed, I'm sending over our enterprise license proposal for Anthropic. The package includes...",
    status: "sent",
    type: "outreach",
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    relatedPersonId: "8",
    relatedOrganizationId: "12",
  },
  {
    id: "em6",
    to: "aravind@perplexity.ai",
    toName: "Aravind Srinivas",
    subject: "Demo Recording & Next Steps",
    body: "Hi Aravind,\n\nThank you for joining the demo today! As promised, here's the recording link and a summary of next steps...",
    status: "delivered",
    type: "follow_up",
    sentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
    relatedPersonId: "11",
    relatedOrganizationId: "24",
  },
  {
    id: "em7",
    to: "marcus@klarna.com",
    toName: "Marcus Johansson",
    subject: "Klarna Integration Timeline",
    body: "Hi Marcus,\n\nI wanted to share the proposed integration timeline for the Klarna project. We're targeting the following milestones...",
    status: "delivered",
    type: "outreach",
    sentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    relatedPersonId: "3",
    relatedOrganizationId: "8",
  },
  {
    id: "em8",
    to: "sebastian@klarna.com",
    toName: "Sebastian Siemiatkowski",
    subject: "Quarterly Review Agenda",
    body: "Hi Sebastian,\n\nHere's the proposed agenda for our upcoming quarterly review meeting...",
    status: "sent",
    type: "outreach",
    sentAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago
    relatedPersonId: "7",
    relatedOrganizationId: "8",
  },
  {
    id: "em9",
    to: "joel@sanalabs.com",
    toName: "Joel Hellermark",
    subject: "Sana Labs - Requirements Doc",
    body: "Hi Joel,\n\nPlease find attached the requirements document for the Sana Labs integration project...",
    status: "failed",
    type: "outreach",
    sentAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    relatedPersonId: "13",
    relatedOrganizationId: "13",
  },
  {
    id: "em10",
    to: "guillermo@vercel.com",
    toName: "Guillermo Rauch",
    subject: "Vercel Co-marketing Proposal",
    body: "Hi Guillermo,\n\nI'd love to explore a co-marketing opportunity between ACME Signal and Vercel. Here's what we have in mind...",
    status: "delivered",
    type: "outreach",
    sentAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    relatedPersonId: "9",
    relatedOrganizationId: "4",
  },
];

export function getEmails(): EmailRecord[] {
  if (typeof window === "undefined") return defaultEmails;

  const stored = localStorage.getItem("emails");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse email data:", e);
      return defaultEmails;
    }
  }

  // Initialize with default data
  localStorage.setItem("emails", JSON.stringify(defaultEmails));
  return defaultEmails;
}

export function saveEmails(emails: EmailRecord[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("emails", JSON.stringify(emails));
}

export function addEmail(email: Omit<EmailRecord, "id">): EmailRecord {
  const emails = getEmails();
  const newEmail: EmailRecord = {
    ...email,
    id: "em" + Math.random().toString(36).substr(2, 9),
  };
  emails.unshift(newEmail);
  saveEmails(emails);
  return newEmail;
}

export function getEmailsForPerson(personId: string): EmailRecord[] {
  return getEmails().filter((email) => email.relatedPersonId === personId);
}

export function getEmailsForOrganization(
  organizationId: string
): EmailRecord[] {
  return getEmails().filter(
    (email) => email.relatedOrganizationId === organizationId
  );
}
