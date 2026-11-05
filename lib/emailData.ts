import type { EmailRecord } from "@/types/email";
import { daysAgo } from "@/lib/demo-data";

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
  {
    id: "em12",
    to: "noah.becker@anthropic.com",
    toName: "Noah Becker",
    subject: "Security questionnaire: answers to your open items",
    body: "Hi Noah,\n\nAttached are our answers on data retention and subprocessors. Happy to walk your team through anything that needs more detail.\n\nBest,\nDavid",
    status: "delivered",
    type: "follow_up",
    sentAt: daysAgo(1, 3),
    relatedPersonId: "27",
    relatedOrganizationId: "12",
  },
  {
    id: "em13",
    to: "tomas@cursor.sh",
    toName: "Tomás Ruiz",
    subject: "Volume pricing for 500 and 1,000 seats",
    body: "Hi Tomás,\n\nAs promised, here's pricing at both tiers. The 1,000-seat tier includes a dedicated success manager.\n\nThanks,\nEmma",
    status: "sent",
    type: "follow_up",
    sentAt: daysAgo(0, 5),
    relatedPersonId: "29",
    relatedOrganizationId: "23",
  },
  {
    id: "em14",
    to: "klara@legora.com",
    toName: "Klara Wiberg",
    subject: "Legal AI pilot: proposed scope",
    body: "Hi Klara,\n\nBased on our call, the pilot would cover the M&A and employment groups for eight weeks. Proposed success metrics are in the doc.\n\nBest,\nSarah",
    status: "delivered",
    type: "outreach",
    sentAt: daysAgo(2, 0),
    relatedPersonId: "25",
    relatedOrganizationId: "21",
  },
  {
    id: "em15",
    to: "ines.holm@qa.tech",
    toName: "Ines Holm",
    subject: "Sandbox walkthrough on Thursday",
    body: "Hi Ines,\n\nLooking forward to Thursday. We'll run the agents against your staging environment and review the results together.\n\nCheers,\nEmma",
    status: "delivered",
    type: "outreach",
    sentAt: daysAgo(3, 2),
    relatedPersonId: "19",
    relatedOrganizationId: "3",
  },
  {
    id: "em16",
    to: "elin.sjoberg@spotify.com",
    toName: "Elin Sjöberg",
    subject: "DPA for countersignature",
    body: "Hi Elin,\n\nHere's the DPA for the renewal, signed on our side. Could you return the countersigned copy by the end of the quarter?\n\nThanks,\nSarah",
    status: "delivered",
    type: "follow_up",
    sentAt: daysAgo(4, 6),
    relatedPersonId: "28",
    relatedOrganizationId: "1",
  },
  {
    id: "em17",
    to: "marcus@klarna.com",
    toName: "Marcus Johansson",
    subject: "Welcome aboard: onboarding workshop",
    body: "Hi Marcus,\n\nThanks for choosing the analytics module. Let's book a two-hour onboarding workshop with your data team.\n\nBest,\nDavid",
    status: "delivered",
    type: "welcome",
    sentAt: daysAgo(7, 0),
    relatedPersonId: "3",
    relatedOrganizationId: "8",
  },
  {
    id: "em18",
    to: "johan@atlar.com",
    toName: "Johan Strand",
    subject: "Pilot success criteria (draft)",
    body: "Hi Johan,\n\nDraft success criteria for the payment platform pilot attached. Let me know what you'd change.\n\nBest,\nDavid",
    status: "sent",
    type: "outreach",
    sentAt: daysAgo(1, 8),
    relatedPersonId: "24",
    relatedOrganizationId: "20",
  },
  {
    id: "em19",
    to: "maya@listenlabs.ai",
    toName: "Maya Goldberg",
    subject: "Onboarding plan for Listen Labs",
    body: "Hi Maya,\n\nSince onboarding time came up, here's a week-by-week plan showing how teams are live within 14 days.\n\nBest,\nSarah",
    status: "failed",
    type: "follow_up",
    sentAt: daysAgo(2, 4),
    relatedPersonId: "26",
    relatedOrganizationId: "25",
  },
  {
    id: "em20",
    to: "pieter@overstory.com",
    toName: "Pieter de Vries",
    subject: "Thanks for the discovery call",
    body: "Hi Pieter,\n\nThanks for the time on Tuesday. I'll update the proposal to weekly change alerts as discussed.\n\nBest,\nEmma",
    status: "delivered",
    type: "follow_up",
    sentAt: daysAgo(1, 1),
    relatedPersonId: "22",
    relatedOrganizationId: "18",
  },
  {
    id: "em21",
    to: "femke@cradle.bio",
    toName: "Femke Janssen",
    subject: "SSO setup guide",
    body: "Hi Femke,\n\nHere's the SSO setup guide for your IT team. Most customers finish setup in under an hour.\n\nBest,\nMichael",
    status: "delivered",
    type: "follow_up",
    sentAt: daysAgo(6, 0),
    relatedPersonId: "23",
    relatedOrganizationId: "19",
  },
  {
    id: "em22",
    to: "hanna.virtanen@wolt.com",
    toName: "Hanna Virtanen",
    subject: "Courier insights: quarterly usage review",
    body: "Hi Hanna,\n\nUsage is up 40% month over month. Could we book 30 minutes to review and talk about a case study?\n\nBest,\nMichael",
    status: "delivered",
    type: "outreach",
    sentAt: daysAgo(9, 0),
    relatedPersonId: "30",
    relatedOrganizationId: "2",
  },
  {
    id: "em23",
    to: "ravi@netlify.com",
    toName: "Ravi Patel",
    subject: "Checking in on the team plan",
    body: "Hi Ravi,\n\nWanted to check in on the team plan upgrade. Happy to send a written summary if that's easier.\n\nBest,\nSarah",
    status: "sent",
    type: "follow_up",
    sentAt: daysAgo(5, 0),
    relatedPersonId: "20",
    relatedOrganizationId: "5",
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
