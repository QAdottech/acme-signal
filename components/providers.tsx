"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app-shell";
import { PublicHeader } from "@/components/public-header";
import { usePathname } from "next/navigation";

const publicRoutes = ["/login", "/signup"];

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
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
