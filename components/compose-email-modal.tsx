"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormDialog } from "@/components/form-dialog";
import { Avatar } from "@/components/record-table/cells";
import { getPeople } from "@/lib/personData";
import { addEmail } from "@/lib/emailData";
import type { Person } from "@/types/person";

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSent: () => void;
}

export function ComposeEmailModal({
  isOpen,
  onClose,
  onSent,
}: ComposeEmailModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [people, setPeople] = useState<Person[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [selectedPersonName, setSelectedPersonName] = useState<string | null>(
    null
  );
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPeople(getPeople());
    }
  }, [isOpen]);

  const filteredPeople = to.length > 0
    ? people.filter(
        (p) =>
          p.name.toLowerCase().includes(to.toLowerCase()) ||
          p.email.toLowerCase().includes(to.toLowerCase())
      )
    : [];

  const handleSelectPerson = (person: Person) => {
    setTo(person.email);
    setSelectedPersonId(person.id);
    setSelectedPersonName(person.name);
    setShowSuggestions(false);
  };

  const handleToChange = (value: string) => {
    setTo(value);
    setSelectedPersonId(null);
    setSelectedPersonName(null);
    setShowSuggestions(value.length > 0);
  };

  const handleSubmit = async () => {
    if (!to || !subject) {
      toast.error("Please fill in the recipient and subject.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, subject, body }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send email");
      }

      addEmail({
        to,
        toName: selectedPersonName || undefined,
        subject,
        body: body || undefined,
        status: data.skipped ? "sent" : "delivered",
        type: "outreach",
        sentAt: new Date().toISOString(),
        relatedPersonId: selectedPersonId || undefined,
      });

      toast.success("Email sent successfully!");
      onSent();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Send email error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send email"
      );
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setTo("");
    setSubject("");
    setBody("");
    setSelectedPersonId(null);
    setSelectedPersonName(null);
    setShowSuggestions(false);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      resetForm();
      onClose();
    }
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={handleOpenChange}
      title="Compose Email"
      description="Send an email to a contact. Start typing to search your contacts."
      submitLabel={sending ? "Sending…" : "Send Email"}
      submitIcon={sending ? <Loader2 className="animate-spin" /> : <Send />}
      submitDisabled={sending || !to || !subject}
      onSubmit={handleSubmit}
    >
      <Field
        label="To"
        htmlFor="email-to"
        required
        wide
        hint={selectedPersonName ? `Sending to ${selectedPersonName}` : undefined}
      >
        <div className="relative">
          <Input
            id="email-to"
            type="text"
            autoComplete="off"
            placeholder="Enter email or search contacts…"
            value={to}
            onChange={(e) => handleToChange(e.target.value)}
            onFocus={() => to.length > 0 && setShowSuggestions(true)}
            // Delay hiding so a click on a suggestion lands first.
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            autoFocus
          />
          {showSuggestions && filteredPeople.length > 0 && (
            <div
              ref={suggestionsRef}
              role="listbox"
              aria-label="Matching contacts"
              className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-md"
            >
              {filteredPeople.slice(0, 8).map((person) => (
                <button
                  key={person.id}
                  type="button"
                  role="option"
                  aria-selected={false}
                  className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-left hover:bg-accent"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectPerson(person);
                  }}
                >
                  <Avatar name={person.name} size={24} />
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium">{person.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {person.email}
                      {person.organization && ` · ${person.organization}`}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>
      <Field label="Subject" htmlFor="email-subject" required wide>
        <Input id="email-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject…" />
      </Field>
      <Field label="Body" htmlFor="email-body" wide>
        <Textarea
          id="email-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          placeholder="Write your email…"
          className="resize-none"
        />
      </Field>
    </FormDialog>
  );
}
