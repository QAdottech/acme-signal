"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app-shell";
import { PublicHeader } from "@/components/public-header";
import { ThemeProvider } from "@/components/theme-provider";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

// Routes that don't require auth loading to complete before rendering
const publicRoutes = ["/login", "/signup", "/customer/sign"];

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
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <AuthGate>{children}</AuthGate>
        <Toaster richColors position="bottom-right" />
      </AuthProvider>
    </ThemeProvider>
  );
}
