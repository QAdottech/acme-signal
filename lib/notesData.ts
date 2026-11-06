import { isDemoBugEnabled } from "@/lib/demo-bugs";
import { daysAgo } from "@/lib/demo-data";

export interface Note {
  id: string;
  /** Company the note belongs to. Empty when it's about a person with no company record. */
  organizationId: string;
  /** Set when the note was written on a person's page. */
  personId?: string;
  /** Set when the note was written on a deal's page. */
  dealId?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

const defaultNotes: Note[] = [
  {
    id: "1",
    organizationId: "1",
    content: "Had a great call with their team. They're interested in expanding the partnership next quarter. Follow up with Daniel about the enterprise plan.",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Sarah Johnson",
  },
  {
    id: "2",
    organizationId: "1",
    content: "Spotify is evaluating competitive offerings. Need to prepare a comparison deck before the next meeting.",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Michael Chen",
  },
  {
    id: "3",
    organizationId: "8",
    content: "Klarna wants to integrate our analytics module. Setting up a technical deep-dive for next week.",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "David Martinez",
  },
  {
    id: "4",
    organizationId: "12",
    content: "Anthropic proposal sent. They need approval from their procurement team. Expected timeline: 2 weeks.",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "David Martinez",
  },
  {
    id: "5",
    organizationId: "4",
    content: "Vercel is very aligned with our product roadmap. Key decision maker is Guillermo. Need to schedule a demo of the new features.",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Emma Wilson",
  },
  {
    id: "6",
    organizationId: "12",
    content: "Strategy discussion: Anthropic wants to explore a multi-year enterprise agreement. Key decision maker is Dario - need to schedule exec dinner.",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "David Martinez",
  },
  {
    id: "7",
    organizationId: "23",
    content: "Cursor technical requirements: They need SSO integration and custom API endpoints. Michael Truell is very hands-on with technical evaluation.",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Emma Wilson",
  },
  {
    id: "8",
    organizationId: "1",
    content: "Spotify Q4 review: Positive feedback on analytics module. Daniel mentioned expanding to 3 more teams next quarter.",
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Sarah Johnson",
  },
  {
    id: "9",
    organizationId: "8",
    content: "Klarna competitive analysis: They're also evaluating Salesforce. Our advantage is faster implementation and better UX. Need to emphasize this in next call.",
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Michael Chen",
  },
  {
    id: "10",
    organizationId: "4",
    content: "Vercel partnership sync: Guillermo is interested in co-marketing. Could be a great channel partner.",
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Emma Wilson",
  },
  {
    id: "11",
    organizationId: "24",
    content: "Perplexity demo prep: Focus on search analytics and real-time dashboards. Aravind specifically asked about API performance benchmarks.",
    createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "David Martinez",
  },
  {
    id: "12",
    organizationId: "14",
    content: "Sana Labs requirements gathering: Joel wants AI-powered learning analytics. This could be a great case study if we land it.",
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    authorName: "Sarah Johnson",
  },
  {
    id: "13",
    organizationId: "12",
    personId: "27",
    dealId: "d7",
    content: "Noah walked through their security review. Two open items: data retention and subprocessors. Sending answers this week.",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    authorName: "David Martinez",
  },
  {
    id: "14",
    organizationId: "23",
    personId: "29",
    dealId: "d14",
    content: "Tomás confirmed 600 seats in year one. Pricing is the last blocker; legal has already approved the MSA.",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    authorName: "Emma Wilson",
  },
  {
    id: "15",
    organizationId: "21",
    personId: "25",
    dealId: "d13",
    content: "Klara has budget sign-off for Q2. Pilot will cover the M&A and employment practice groups.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    authorName: "Sarah Johnson",
  },
  {
    id: "16",
    organizationId: "3",
    personId: "19",
    dealId: "d1",
    content: "Ines wants to see the agents run against their staging environment. Booked a sandbox walkthrough.",
    createdAt: daysAgo(4),
    updatedAt: daysAgo(4),
    authorName: "Emma Wilson",
  },
  {
    id: "17",
    organizationId: "1",
    personId: "28",
    dealId: "d18",
    content: "Renewal signed for another year. Elin flagged that the DPA still needs a countersignature.",
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
    authorName: "Sarah Johnson",
  },
  {
    id: "18",
    organizationId: "8",
    personId: "3",
    dealId: "d19",
    content: "Klarna signed the analytics module. Marcus will own rollout; onboarding workshop to be booked.",
    createdAt: daysAgo(8),
    updatedAt: daysAgo(8),
    authorName: "David Martinez",
  },
  {
    id: "19",
    organizationId: "17",
    personId: "17",
    dealId: "d26",
    content: "Jasper went with an in-house build. They liked the product but the timeline didn't fit their platform migration.",
    createdAt: daysAgo(20),
    updatedAt: daysAgo(20),
    authorName: "Sarah Johnson",
  },
  {
    id: "20",
    organizationId: "5",
    personId: "20",
    dealId: "d27",
    content: "Netlify passed on the enterprise support plan for now. Price was the main objection; revisit in H2.",
    createdAt: daysAgo(40),
    updatedAt: daysAgo(40),
    authorName: "Sarah Johnson",
  },
  {
    id: "21",
    organizationId: "20",
    personId: "24",
    dealId: "d12",
    content: "Johan is open to a pilot if we agree on measurable success criteria up front. Drafting them now.",
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    authorName: "David Martinez",
  },
  {
    id: "22",
    organizationId: "25",
    personId: "26",
    dealId: "d16",
    content: "Maya is comparing three vendors. Our edge is the integrations; their concern is onboarding time.",
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    authorName: "Sarah Johnson",
  },
  {
    id: "23",
    organizationId: "18",
    personId: "22",
    dealId: "d10",
    content: "Discovery call with Pieter: utilities customers want weekly change alerts, not daily. Adjusting the proposal.",
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    authorName: "Emma Wilson",
  },
  {
    id: "24",
    organizationId: "19",
    personId: "23",
    dealId: "d11",
    content: "Femke can't roll out to the research team without SSO. Sent the setup guide; waiting on their IT.",
    createdAt: daysAgo(6),
    updatedAt: daysAgo(6),
    authorName: "Michael Chen",
  },
  {
    id: "25",
    organizationId: "15",
    personId: "2",
    dealId: "d20",
    content: "Figma design ops is happy with the seats. Sarah hinted at an expansion to the brand team in spring.",
    createdAt: daysAgo(15),
    updatedAt: daysAgo(15),
    authorName: "Michael Chen",
  },
  {
    id: "26",
    organizationId: "2",
    personId: "30",
    dealId: "d21",
    content: "Hanna reports courier insights usage up 40% month over month. Good candidate for a case study.",
    createdAt: daysAgo(9),
    updatedAt: daysAgo(9),
    authorName: "Michael Chen",
  },
];

export function getNotes(): Note[] {
  if (typeof window === "undefined") return defaultNotes;

  const stored = localStorage.getItem("notes");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse notes:", e);
      return defaultNotes;
    }
  }

  localStorage.setItem("notes", JSON.stringify(defaultNotes));
  return defaultNotes;
}

export function getNotesForOrganization(organizationId: string): Note[] {
  return getNotes().filter((note) => note.organizationId === organizationId);
}

export function getNotesForPerson(personId: string): Note[] {
  return getNotes().filter((note) => note.personId === personId);
}

export function addNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note {
  const notes = getNotes();
  const newNote: Note = {
    ...note,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newNote, ...notes];
  // DEMO BUG: notes-not-saved — the note is returned (and shown) but never stored.
  if (!isDemoBugEnabled("notes-not-saved")) {
    localStorage.setItem("notes", JSON.stringify(updated));
  }
  return newNote;
}

export function deleteNote(noteId: string): void {
  const notes = getNotes().filter((n) => n.id !== noteId);
  localStorage.setItem("notes", JSON.stringify(notes));
}
