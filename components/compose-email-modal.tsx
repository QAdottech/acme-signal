"use client";

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addEmail } from "@/lib/emailData";
import { getPeople } from "@/lib/personData";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Send an email to a contact. Start typing to search your contacts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-to">To</Label>
            <div className="relative">
              <Input
                id="email-to"
                type="text"
                placeholder="Enter email or search contacts..."
                value={to}
                onChange={(e) => handleToChange(e.target.value)}
                onFocus={() => {
                  if (to.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Delay hiding so click on suggestion works
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
                className="bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
              />
              {showSuggestions && filteredPeople.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border rounded-md shadow-lg max-h-48 overflow-y-auto"
                >
                  {filteredPeople.slice(0, 8).map((person) => (
                    <button
                      key={person.id}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectPerson(person);
                      }}
                    >
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          {person.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {person.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {person.email}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selectedPersonName && (
              <p className="text-xs text-muted-foreground">
                Sending to {selectedPersonName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              type="text"
              placeholder="Email subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email-body">Body</Label>
            <Textarea
              id="email-body"
              placeholder="Write your email..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending || !to || !subject}
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Email
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
