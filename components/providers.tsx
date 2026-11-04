"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app-shell";
import { PublicHeader } from "@/components/public-header";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
import { ensureCurrentSeedData } from "@/lib/demo-data";
import { applyDemoBugsFromUrl } from "@/lib/demo-bugs";
import { ConfirmProvider } from "@/components/confirm-dialog";

// Runs on the client before any page reads seeded data from localStorage.
ensureCurrentSeedData();
// A demo link can switch demo bugs on or off with ?demoBugs=… before any page reads data.
applyDemoBugsFromUrl();

// Routes that don't require auth loading to complete before rendering
const publicRoutes = [
  "/login",
  "/customer/sign",
  "/turnstile-test",
  "/basic-auth",
];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = !pathname || publicRoutes.includes(pathname);

  if (isPublicRoute) {
    return (
      <>
        <PublicHeader />
        {children}
      </>
    );
  }

  if (isLoading) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ConfirmProvider>
        <AuthGate>{children}</AuthGate>
      </ConfirmProvider>
      <Toaster position="bottom-right" />
    </AuthProvider>
  );
}
