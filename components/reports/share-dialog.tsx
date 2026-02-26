"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { Loader2, Mail } from "lucide-react";

export interface ReportEmailData {
  title: string;
  description: string;
  metrics: { label: string; value: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  generatedAt: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportTitle: string;
  reportData: ReportEmailData;
}

export function ShareDialog({
  open,
  onOpenChange,
  reportTitle,
  reportData,
}: ShareDialogProps) {
  const { user } = useAuth();
  const [recipientEmail, setRecipientEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async () => {
    if (!recipientEmail.trim()) {
      toast.error("Please enter a recipient email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch("/api/reports/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: recipientEmail.trim(),
          senderName: user?.fullName || "A colleague",
          reportData,
          personalMessage: personalMessage.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send email");
      }

      toast.success(`Report sent to ${recipientEmail.trim()}`);
      setRecipientEmail("");
      setPersonalMessage("");
      onOpenChange(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to send report email";
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    if (!isSending) {
      if (!value) {
        setRecipientEmail("");
        setPersonalMessage("");
      }
      onOpenChange(value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Share Report
          </DialogTitle>
          <DialogDescription>
            Send &ldquo;{reportTitle}&rdquo; via email to a colleague.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="recipient-email">Recipient email *</Label>
            <Input
              id="recipient-email"
              type="email"
              placeholder="colleague@company.com"
              value={recipientEmail}
              onChange={(e) => setRecipientEmail(e.target.value)}
              disabled={isSending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal-message">
              Personal message{" "}
              <span className="text-muted-foreground font-normal">
                (optional)
              </span>
            </Label>
            <Textarea
              id="personal-message"
              placeholder="Hey, check out this report..."
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              disabled={isSending}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Send
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
