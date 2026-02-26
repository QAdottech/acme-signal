"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EditProfileClient() {
  const { user, updateUser, isLoading } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      setFullName(user.fullName);
      setAvatar(user.avatar);
    }
  }, [user, isLoading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ fullName, avatar });
    router.push("/");
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setAvatar(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 container py-8 max-w-[1400px] mx-auto px-6">
          <div className="flex items-center justify-center">
            <div>Loading...</div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return null; // This will be handled by the redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8 max-w-[1400px] mx-auto px-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar</Label>
                <div className="flex items-center space-x-4">
                  {avatar && (
                    <div className="w-16 h-16 rounded-full overflow-hidden">
                      <img
                        src={avatar || "/placeholder.svg"}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Save Changes
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
