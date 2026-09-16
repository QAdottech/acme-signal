import { getSupabase, newId, throwIfError } from "@/lib/supabase";

export interface Note {
  id: string;
  organizationId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}

interface NoteRow {
  id: string;
  organization_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_name: string;
}

function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    organizationId: row.organization_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    authorName: row.author_name,
  };
}

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await getSupabase()
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });
  throwIfError(error, "getNotes");
  return ((data ?? []) as NoteRow[]).map(mapNote);
}

export async function getNotesForOrganization(
  organizationId: string
): Promise<Note[]> {
  const { data, error } = await getSupabase()
    .from("notes")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });
  throwIfError(error, "getNotesForOrganization");
  return ((data ?? []) as NoteRow[]).map(mapNote);
}

export async function addNote(
  note: Omit<Note, "id" | "createdAt" | "updatedAt">
): Promise<Note> {
  const now = new Date().toISOString();
  const created: Note = {
    ...note,
    id: newId(),
    createdAt: now,
    updatedAt: now,
  };
  const { error } = await getSupabase().from("notes").insert({
    id: created.id,
    organization_id: created.organizationId,
    content: created.content,
    created_at: created.createdAt,
    updated_at: created.updatedAt,
    author_name: created.authorName,
  });
  throwIfError(error, "addNote");
  return created;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await getSupabase().from("notes").delete().eq("id", noteId);
  throwIfError(error, "deleteNote");
}
