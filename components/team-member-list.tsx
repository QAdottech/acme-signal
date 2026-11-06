"use client";

import { MoreHorizontal, UserMinus } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useConfirm } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Avatar, InlineSelect } from "@/components/record-table/cells";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Role = "admin" | "member";
const ROLES: Role[] = ["admin", "member"];
const ROLE_META: Record<Role, { label: string; hint: string }> = {
  admin: { label: "Admin", hint: "Manages the team and workspace" },
  member: { label: "Member", hint: "Works with records" },
};

/**
 * Workspace members: who they are, their role (editable inline), and a row
 * menu to remove them. You can't remove yourself or leave the workspace
 * without an admin.
 */
export function TeamMemberList() {
  const confirm = useConfirm();
  const { user, users, updateUserRole, removeUser } = useAuth();
  const adminCount = users.filter((u) => u.role === "admin").length;

  const changeRole = async (memberId: string, name: string, role: Role) => {
    const member = users.find((u) => u.id === memberId);
    if (!member || member.role === role) return;
    if (member.role === "admin" && adminCount === 1) {
      toast.error("The workspace needs at least one admin.");
      return;
    }
    await updateUserRole(memberId, role);
    toast.success(`${name} is now ${role === "admin" ? "an admin" : "a member"}`);
  };

  const remove = async (memberId: string, name: string) => {
    const ok = await confirm({
      title: `Remove ${name} from the team?`,
      description: "They will lose access to the workspace.",
      confirmLabel: "Remove user",
    });
    if (!ok) return;
    await removeUser(memberId);
    toast.success(`Removed ${name}`);
  };

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="h-9 px-4 font-medium">Name</th>
            <th className="h-9 px-4 font-medium">Email</th>
            <th className="h-9 w-48 px-4 font-medium">Role</th>
            <th className="h-9 w-12 px-2">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((member) => {
            const name = member.fullName || member.email;
            const isYou = member.id === user?.id;
            const lastAdmin = member.role === "admin" && adminCount === 1;
            return (
              <tr key={member.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="h-12 px-4">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <Avatar name={name} size={24} />
                    <span className="truncate font-medium">{name}</span>
                    {isYou && <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">You</span>}
                    {member.invited && (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                        Invited
                      </span>
                    )}
                  </span>
                </td>
                <td className="h-12 px-4 text-muted-foreground">{member.email}</td>
                <td className="h-12 px-4">
                  <InlineSelect
                    label="Role"
                    value={member.role}
                    options={ROLES}
                    onChange={(role) => changeRole(member.id, name, role)}
                    renderValue={(role) => (role ? ROLE_META[role].label : "—")}
                    renderOption={(role) => (
                      <span className="flex flex-col">
                        <span>{ROLE_META[role].label}</span>
                        <span className="text-xs text-muted-foreground">{ROLE_META[role].hint}</span>
                      </span>
                    )}
                  />
                </td>
                <td className="h-12 px-2 text-right">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label={`Actions for ${name}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        disabled={isYou || lastAdmin}
                        onSelect={() => remove(member.id, name)}
                        className={cn("text-[13px]", !(isYou || lastAdmin) && "text-red-600 focus:text-red-600")}
                      >
                        <UserMinus />
                        {isYou ? "You can't remove yourself" : lastAdmin ? "Last admin can't be removed" : "Remove from team"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
