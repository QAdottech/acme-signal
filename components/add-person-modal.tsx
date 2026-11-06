"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, Field, FormDialog } from "@/components/form-dialog";
import { getOrganizations } from "@/lib/organizationData";
import type { Person } from "@/types/person";

interface AddPersonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (person: Omit<Person, "id">) => void;
}

const EMPTY = {
  name: "",
  email: "",
  role: "",
  organization: "",
  phone: "",
  linkedIn: "",
  notes: "",
  status: "Active" as Person["status"],
  lastContact: "",
};

export function AddPersonModal({ isOpen, onClose, onAdd }: AddPersonModalProps) {
  return <PersonFormDialog isOpen={isOpen} onClose={onClose} onSubmit={onAdd} />;
}

/** Edit an existing person in the same form. */
export function EditPersonModal({
  isOpen,
  person,
  onClose,
  onSave,
}: {
  isOpen: boolean;
  person: Person | null;
  onClose: () => void;
  onSave: (person: Person) => void;
}) {
  if (!person) return null;
  return (
    <PersonFormDialog
      isOpen={isOpen}
      onClose={onClose}
      initial={person}
      onSubmit={(values) => onSave({ ...values, id: person.id, avatar: person.avatar })}
    />
  );
}

function toForm(person?: Person): typeof EMPTY {
  if (!person) return EMPTY;
  return {
    name: person.name,
    email: person.email,
    role: person.role ?? "",
    organization: person.organization ?? "",
    phone: person.phone ?? "",
    linkedIn: person.linkedIn ?? "",
    notes: person.notes ?? "",
    status: person.status,
    lastContact: person.lastContact ?? "",
  };
}

function PersonFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (person: Omit<Person, "id">) => void;
  initial?: Person;
}) {
  const editing = !!initial;
  const [form, setForm] = useState(() => toForm(initial));
  useEffect(() => {
    if (isOpen) setForm(toForm(initial));
  }, [isOpen, initial]);
  const set = (field: keyof typeof EMPTY, value: string) => setForm((prev) => ({ ...prev, [field]: value }));

  // Suggest existing companies; any other name is kept as typed.
  const companyNames = useMemo(
    () => (isOpen ? getOrganizations().map((o) => o.name).sort((a, b) => a.localeCompare(b)) : []),
    [isOpen]
  );

  const close = () => {
    setForm(EMPTY);
    onClose();
  };

  const submit = () => {
    onSubmit({
      ...form,
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role.trim(),
      organization: form.organization.trim(),
    });
    if (!editing) setForm(EMPTY);
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title={editing ? "Edit Person" : "Create Person"}
      description={editing ? "Update this person's details." : "Add a contact to your CRM."}
      submitLabel={editing ? "Save Changes" : "Create Person"}
      submitDisabled={!form.name.trim() || !form.email.trim()}
      onSubmit={submit}
    >
      <Field label="Name" htmlFor="person-name" required>
        <Input id="person-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Jane Doe" autoFocus={!editing} />
      </Field>
      <Field label="Email" htmlFor="person-email" required>
        <Input id="person-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="jane@company.com" />
      </Field>
      <Field label="Role" htmlFor="person-role">
        <Input id="person-role" value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="e.g., CEO, VP of Product" />
      </Field>
      <Field label="Organization" htmlFor="person-organization">
        <Input
          id="person-organization"
          list="person-organization-options"
          value={form.organization}
          onChange={(e) => set("organization", e.target.value)}
          placeholder="Company name"
          autoComplete="off"
        />
        <datalist id="person-organization-options">
          {companyNames.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </Field>
      <Field label="Phone" htmlFor="person-phone">
        <Input id="person-phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+46 70 123 4567" />
      </Field>
      <Field label="LinkedIn" htmlFor="person-linkedin">
        <Input id="person-linkedin" value={form.linkedIn} onChange={(e) => set("linkedIn", e.target.value)} placeholder="https://linkedin.com/in/…" />
      </Field>
      <Field label="Status" htmlFor="person-status">
        <Combobox
          id="person-status"
          value={form.status}
          onChange={(status) => set("status", status)}
          options={[
            { value: "Active", label: "Active" },
            { value: "Inactive", label: "Inactive" },
          ]}
        />
      </Field>
      <Field label="Last Contact" htmlFor="person-last-contact">
        <Input id="person-last-contact" type="date" value={form.lastContact} onChange={(e) => set("lastContact", e.target.value)} />
      </Field>
      <Field label="Notes" htmlFor="person-notes" wide>
        <Textarea id="person-notes" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={3} placeholder="Anything worth remembering…" />
      </Field>
    </FormDialog>
  );
}
