"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMemberList } from "@/components/team-member-list";
import { InviteUserModal } from "@/components/invite-user-modal";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/page-header";

export function TeamClient() {
  const { user, isAdmin, isLoading } = useAuth();
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

  // Show loading state while authentication is being determined
  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-[1400px] px-8 py-6">
        <div className="flex items-center justify-center">
          <div>Loading...</div>
        </div>
      </main>
    );
  }

  // Don't render anything if user is not loaded or not admin
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-8 py-6">
      <PageHeader
        title="Team"
        description="Manage who has access to this workspace."
        actions={
          <Button onClick={() => setIsInviteModalOpen(true)}>
            Invite User
          </Button>
        }
      />
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <TeamMemberList />
        </CardContent>
      </Card>
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
