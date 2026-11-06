"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Combobox, Field, FormDialog } from "@/components/form-dialog";
import { useAuth } from "@/lib/auth-context";

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function InviteUserModal({ isOpen, onClose }: InviteUserModalProps) {
  const { inviteUser } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const close = () => {
    setEmail("");
    setRole("member");
    onClose();
  };

  const submit = async () => {
    try {
      await inviteUser(email, role);
      toast.success(`Invitation sent to ${email.trim()}`);
      close();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't send the invitation.");
    }
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title="Invite Member"
      description="They'll get an email with a link to join this workspace."
      submitLabel="Send Invite"
      submitDisabled={!EMAIL.test(email.trim())}
      onSubmit={submit}
      size="sm"
    >
      <Field label="Email" htmlFor="invite-email" required wide>
        <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" autoFocus />
      </Field>
      <Field label="Role" htmlFor="invite-role" wide>
        <Combobox
          id="invite-role"
          value={role}
          onChange={(r) => setRole(r as "admin" | "member")}
          options={[
            { value: "member", label: "Member" },
            { value: "admin", label: "Admin" },
          ]}
        />
      </Field>
    </FormDialog>
  );
}
