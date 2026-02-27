"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import { formatDealValue } from "@/lib/dealData";
import { Check, Copy, Loader2, Mail, Link as LinkIcon } from "lucide-react";

interface SendForSignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  deal: Deal;
  organization: Organization;
  onSent: (recipientEmail: string) => void;
}

export function SendForSignatureModal({
  isOpen,
  onClose,
  deal,
  organization,
  onSent,
}: SendForSignatureModalProps) {
  const [recipientEmail, setRecipientEmail] = useState("");
  const [termLength, setTermLength] = useState("12 months");
  const [billingFrequency, setBillingFrequency] = useState("Annual");
  const [paymentTerms, setPaymentTerms] = useState("Net 30");
  const [seats, setSeats] = useState("");
  const [slaTier, setSlaTier] = useState("");
  const [renewalBehavior, setRenewalBehavior] = useState("Auto-renew");
  const [cancellationWindow, setCancellationWindow] = useState("30 days");
  const [personalMessage, setPersonalMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildSignUrl = () => {
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || "";
    const params = new URLSearchParams();
    params.set("customer_name", organization.name);
    params.set("customer_company", organization.name);
    params.set("deal_name", deal.title);
    params.set("amount", deal.value.toString());
    params.set("currency", deal.currency || "USD");
    if (termLength) params.set("term_length", termLength);
    if (billingFrequency) params.set("billing_frequency", billingFrequency);
    if (paymentTerms) params.set("payment_terms", paymentTerms);
    if (seats) params.set("seats", seats);
    if (slaTier) params.set("sla_tier", slaTier);
    if (renewalBehavior) params.set("renewal_behavior", renewalBehavior);
    if (cancellationWindow)
      params.set("cancellation_window", cancellationWindow);
    if (recipientEmail) params.set("recipient_email", recipientEmail);
    params.set("proposal_id", deal.id);
    params.set("rep_name", deal.owner);
    return `${baseUrl}/customer/sign?${params.toString()}`;
  };

  const handleCopyLink = () => {
    const url = buildSignUrl();
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    setSending(true);
    try {
      const signUrl = buildSignUrl();
      const amount = formatDealValue(deal.value, deal.currency);

      await fetch("/api/send-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail,
          customerName: organization.name,
          dealName: deal.title,
          amount,
          senderName: deal.owner,
          signUrl,
          personalMessage: personalMessage || undefined,
        }),
      });

      onSent(recipientEmail);
      onClose();
    } catch (error) {
      console.error("Failed to send signature email:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Send for Signature</DialogTitle>
          <DialogDescription>
            Send {deal.title} ({formatDealValue(deal.value, deal.currency)}) to{" "}
            {organization.name} for signing.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSendEmail}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-email" className="text-right">
                Recipient
              </Label>
              <Input
                id="sig-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="customer@company.com"
                required
              />
            </div>

            <div className="col-span-4 px-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 pl-[calc(25%+8px)]">
                Proposal Terms
              </p>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-term" className="text-right">
                Term
              </Label>
              <Input
                id="sig-term"
                value={termLength}
                onChange={(e) => setTermLength(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="12 months"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-billing" className="text-right">
                Billing
              </Label>
              <Input
                id="sig-billing"
                value={billingFrequency}
                onChange={(e) => setBillingFrequency(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Annual"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-payment" className="text-right">
                Payment
              </Label>
              <Input
                id="sig-payment"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Net 30"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-seats" className="text-right">
                Seats
              </Label>
              <Input
                id="sig-seats"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="10 seats"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-sla" className="text-right">
                SLA
              </Label>
              <Input
                id="sig-sla"
                value={slaTier}
                onChange={(e) => setSlaTier(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Standard"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-renewal" className="text-right">
                Renewal
              </Label>
              <Input
                id="sig-renewal"
                value={renewalBehavior}
                onChange={(e) => setRenewalBehavior(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Auto-renew"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="sig-cancel" className="text-right">
                Cancel
              </Label>
              <Input
                id="sig-cancel"
                value={cancellationWindow}
                onChange={(e) => setCancellationWindow(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="30 days"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="sig-message" className="text-right pt-2">
                Message
              </Label>
              <Textarea
                id="sig-message"
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Optional personal note to include in the email..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              className="gap-1.5"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <LinkIcon className="w-4 h-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
              disabled={!recipientEmail || sending}
            >
              {sending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Send for Signature
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
