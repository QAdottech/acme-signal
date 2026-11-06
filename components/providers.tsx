"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app-shell";
import { PublicHeader } from "@/components/public-header";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { ensureCurrentSeedData } from "@/lib/demo-data";
import { applyDemoUrlParams } from "@/lib/demo-url";
import { ConfirmProvider } from "@/components/confirm-dialog";

// Runs on the client before any page reads seeded data from localStorage.
ensureCurrentSeedData();
// A demo link can reset data (?resetDemo=1) and switch demo bugs (?demoBugs=…)
// before any page reads data.
applyDemoUrlParams();

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

  // Demo params can also arrive by client-side navigation, e.g. the redirect
  // back from /login?from=/?resetDemo=1. Apply them and reload once so every
  // page starts from the new state.
  useEffect(() => {
    if (applyDemoUrlParams()) window.location.reload();
  }, [pathname]);

  const isPublicRoute = !pathname || publicRoutes.includes(pathname);

  if (isPublicRoute) {
    // The login page carries its own logo; other public pages get a header.
    if (pathname === "/login") return <>{children}</>;
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
