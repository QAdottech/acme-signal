export interface Note {
  id: string;
  organizationId: string;
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

export function addNote(note: Omit<Note, "id" | "createdAt" | "updatedAt">): Note {
  const notes = getNotes();
  const newNote: Note = {
    ...note,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newNote, ...notes];
  localStorage.setItem("notes", JSON.stringify(updated));
  return newNote;
}

export function deleteNote(noteId: string): void {
  const notes = getNotes().filter((n) => n.id !== noteId);
  localStorage.setItem("notes", JSON.stringify(notes));
}
