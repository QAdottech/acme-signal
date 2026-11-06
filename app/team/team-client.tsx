"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { TeamMemberList } from "@/components/team-member-list";
import { InviteUserModal } from "@/components/invite-user-modal";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";

export function TeamClient() {
  const { user, users, isAdmin, isLoading } = useAuth();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're done loading and conditions are not met
    if (!isLoading) {
      if (!user) {
        router.push("/login");
      } else if (!isAdmin) {
        router.push("/");
      }
    }
  }, [user, isAdmin, isLoading, router]);

  // Render nothing until we know who is signed in.
  if (isLoading) {
    return null;
  }

  // Don't render anything if user is not loaded or not admin
  if (!user || !isAdmin) {
    return null;
  }

  const admins = users.filter((u) => u.role === "admin").length;
  const invited = users.filter((u) => u.invited).length;

  return (
    <main className="mx-auto w-full max-w-[1000px] px-8 py-6">
      <PageHeader
        title="Team"
        description={[
          `${users.length} ${users.length === 1 ? "member" : "members"}`,
          `${admins} ${admins === 1 ? "admin" : "admins"}`,
          invited > 0 ? `${invited} invited` : null,
        ]
          .filter(Boolean)
          .join(" · ")}
        actions={
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus />
            Invite Member
          </Button>
        }
      />
      <TeamMemberList />
      <InviteUserModal isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} />
    </main>
  );
}
