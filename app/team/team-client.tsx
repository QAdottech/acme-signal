"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamMemberList } from "@/components/team-member-list";
import { InviteUserModal } from "@/components/invite-user-modal";
import { useRouter } from "next/navigation";

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
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-16 max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-center">
            <div>Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  // Don't render anything if user is not loaded or not admin
  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="container py-16 max-w-[1400px] mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Team Management</h1>
        <Button
          onClick={() => setIsInviteModalOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          Invite User
        </Button>
      </div>
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
