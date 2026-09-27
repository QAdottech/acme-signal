import { getOrganizations, getCollections } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { getDeals } from "@/lib/dealData";
import { getTasks } from "@/lib/taskData";
import { getNotes } from "@/lib/notesData";

export type SearchCategory =
  | "Organizations"
  | "People"
  | "Deals"
  | "Tasks"
  | "Notes"
  | "Collections";

export type SearchResult = {
  id: string;
  category: SearchCategory;
  label: string;
  detail: string;
  href: string;
  keywords: string;
};

export function searchRecords(query: string): SearchResult[] {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const organizations = getOrganizations();
  const people = getPeople();
  const deals = getDeals();
  const tasks = getTasks();
  const notes = getNotes();
  const collections = getCollections();

  const records: SearchResult[] = [
    ...organizations.map((org) => ({
      id: org.id,
      category: "Organizations" as const,
      label: org.name,
      detail: `${org.location} · ${org.industry}`,
      href: `/organizations/${org.id}`,
      keywords: `${org.name} ${org.location} ${org.industry}`,
    })),
    ...people.map((person) => ({
      id: person.id,
      category: "People" as const,
      label: person.name,
      detail: `${person.role} · ${person.organization}`,
      href: `/people?search=${encodeURIComponent(person.name)}`,
      keywords: `${person.name} ${person.email} ${person.organization} ${person.role}`,
    })),
    ...deals.map((deal) => ({
      id: deal.id,
      category: "Deals" as const,
      label: deal.title,
      detail: `${organizations.find((org) => org.id === deal.organizationId)?.name ?? "Unknown organization"} · ${deal.stage}`,
      href: `/deals/${deal.organizationId}`,
      keywords: `${deal.title} ${deal.owner} ${organizations.find((org) => org.id === deal.organizationId)?.name ?? ""}`,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      category: "Tasks" as const,
      label: task.title,
      detail: `${task.assignee ?? "Unassigned"} · ${task.status.replace("_", " ")}`,
      href: `/tasks?search=${encodeURIComponent(task.title)}`,
      keywords: `${task.title} ${task.description ?? ""} ${task.assignee ?? ""}`,
    })),
    ...notes.map((note) => ({
      id: note.id,
      category: "Notes" as const,
      label: note.content.length > 65 ? `${note.content.slice(0, 65)}…` : note.content,
      detail: `Note by ${note.authorName}`,
      href: `/organizations/${note.organizationId}`,
      keywords: `${note.content} ${note.authorName}`,
    })),
    ...collections.map((collection) => ({
      id: collection.id,
      category: "Collections" as const,
      label: collection.name,
      detail: `${collection.organizationIds.length} organizations`,
      href: `/collections/${collection.id}`,
      keywords: `${collection.name} ${collection.description} ${collection.tags.join(" ")}`,
    })),
  ];

  return records.filter((record) => record.keywords.toLowerCase().includes(term));
}
