"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, Field, FormDialog } from "@/components/form-dialog";
import { CompanyLogo } from "@/components/record-table/cells";
import { addNote } from "@/lib/notesData";
import { useAuth } from "@/lib/auth-context";
import type { Organization } from "@/types/organization";

interface AddNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNoteAdded: () => void;
  organizations: Organization[];
}

export function AddNoteModal({ open, onOpenChange, onNoteAdded, organizations }: AddNoteModalProps) {
  const { user } = useAuth();
  const [organizationId, setOrganizationId] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState(user?.fullName || "");

  const options = useMemo(
    () =>
      [...organizations]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((org) => ({ value: org.id, label: org.name, keywords: [org.industry], icon: <CompanyLogo name={org.name} logo={org.logo} /> })),
    [organizations]
  );

  const reset = () => {
    setOrganizationId("");
    setContent("");
    setAuthorName(user?.fullName || "");
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = () => {
    addNote({ organizationId, content: content.trim(), authorName: authorName.trim() || "Unknown" });
    reset();
    onNoteAdded();
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Note"
      description="Write a note about a company. It appears on the company's page."
      submitLabel="Create Note"
      submitDisabled={!organizationId || !content.trim()}
      onSubmit={submit}
    >
      <Field label="Company" htmlFor="note-company" required>
        <Combobox
          id="note-company"
          value={organizationId}
          onChange={setOrganizationId}
          placeholder="Select company…"
          searchPlaceholder="Search companies…"
          emptyText="No company found."
          options={options}
        />
      </Field>
      <Field label="Author" htmlFor="note-author">
        <Input id="note-author" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Your name" />
      </Field>
      <Field label="Note" htmlFor="note-content" required wide>
        <Textarea
          id="note-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          placeholder="Write your note here…"
          className="resize-none"
        />
      </Field>
    </FormDialog>
  );
}
