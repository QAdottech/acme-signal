import { Person } from "@/types/person";

// Sample people data
const defaultPeople: Person[] = [
  {
    id: "1",
    name: "Daniel Ek",
    email: "daniel@spotify.com",
    role: "CEO",
    organization: "Spotify",
    phone: "+46 70 123 4567",
    linkedIn: "https://linkedin.com/in/danielek",
    notes: "Founder and CEO of Spotify. Very interested in AI and podcasting.",
    status: "Active",
    lastContact: "2024-03-15",
  },
  {
    id: "2",
    name: "Sarah Chen",
    email: "sarah.chen@figma.com",
    role: "VP of Product",
    organization: "Figma",
    phone: "+1 415 555 0123",
    linkedIn: "https://linkedin.com/in/sarahchen",
    notes: "Leading product development for enterprise features.",
    status: "Active",
    lastContact: "2024-03-10",
  },
  {
    id: "3",
    name: "Marcus Johansson",
    email: "marcus@klarna.com",
    role: "CTO",
    organization: "Klarna",
    phone: "+46 70 987 6543",
    linkedIn: "https://linkedin.com/in/marcusj",
    notes: "Technical lead, focused on payment infrastructure.",
    status: "Active",
    lastContact: "2024-02-28",
  },
  {
    id: "4",
    name: "Emily Rodriguez",
    email: "emily@anyfin.com",
    role: "CFO",
    organization: "Anyfin",
    phone: "+46 73 456 7890",
    linkedIn: "https://linkedin.com/in/emilyrodriguez",
    notes: "Financial strategy and fundraising lead.",
    status: "Active",
    lastContact: "2024-03-01",
  },
  {
    id: "5",
    name: "James Wilson",
    email: "james@vercel.com",
    role: "Head of Sales",
    organization: "Vercel",
    phone: "+1 555 234 5678",
    linkedIn: "https://linkedin.com/in/jameswilson",
    notes: "Managing enterprise sales and partnerships.",
    status: "Active",
    lastContact: "2024-03-12",
  },
];

export function getPeople(): Person[] {
  if (typeof window === "undefined") return defaultPeople;

  const stored = localStorage.getItem("people");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse people data:", e);
      return defaultPeople;
    }
  }

  // Initialize with default data
  localStorage.setItem("people", JSON.stringify(defaultPeople));
  return defaultPeople;
}

export function savePeople(people: Person[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("people", JSON.stringify(people));
}
