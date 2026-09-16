import { Person } from "@/types/person";
import { getSupabase, newId, throwIfError } from "@/lib/supabase";

interface PersonRow {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  phone: string | null;
  linkedin: string | null;
  notes: string | null;
  avatar: string | null;
  status: Person["status"];
  last_contact: string | null;
}

function mapPerson(row: PersonRow): Person {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    organization: row.organization,
    phone: row.phone ?? undefined,
    linkedIn: row.linkedin ?? undefined,
    notes: row.notes ?? undefined,
    avatar: row.avatar ?? undefined,
    status: row.status,
    lastContact: row.last_contact ?? undefined,
  };
}

function toRow(person: Person): PersonRow {
  return {
    id: person.id,
    name: person.name,
    email: person.email,
    role: person.role,
    organization: person.organization,
    phone: person.phone ?? null,
    linkedin: person.linkedIn ?? null,
    notes: person.notes ?? null,
    avatar: person.avatar ?? null,
    status: person.status,
    last_contact: person.lastContact ?? null,
  };
}

export async function getPeople(): Promise<Person[]> {
  const { data, error } = await getSupabase().from("people").select("*");
  throwIfError(error, "getPeople");
  return ((data ?? []) as PersonRow[]).map(mapPerson);
}

export async function addPerson(
  person: Omit<Person, "id">
): Promise<Person> {
  const created: Person = { ...person, id: newId() };
  const { error } = await getSupabase().from("people").insert(toRow(created));
  throwIfError(error, "addPerson");
  return created;
}

export async function updatePerson(person: Person): Promise<Person> {
  const { error } = await getSupabase()
    .from("people")
    .update(toRow(person))
    .eq("id", person.id);
  throwIfError(error, "updatePerson");
  return person;
}

export async function deletePeople(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const { error } = await getSupabase().from("people").delete().in("id", ids);
  throwIfError(error, "deletePeople");
}

export async function savePeople(people: Person[]): Promise<void> {
  const existing = await getPeople();
  const nextIds = new Set(people.map((person) => person.id));
  const toDelete = existing
    .filter((person) => !nextIds.has(person.id))
    .map((person) => person.id);
  await deletePeople(toDelete);
  if (people.length === 0) return;
  const { error } = await getSupabase().from("people").upsert(people.map(toRow));
  throwIfError(error, "savePeople");
}
