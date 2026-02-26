"use client";

import { AuthProvider, useAuth } from "@/lib/auth-context";
import { HeaderWrapper } from "@/components/header-wrapper";
import { usePathname } from "next/navigation";

// Routes that don't require auth loading to complete before rendering
const publicRoutes = ["/login", "/signup", "/customer/sign"];

function AuthGate({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  // pathname can be null before hydration - don't block rendering in that case
  const isPublicRoute = !pathname || publicRoutes.includes(pathname);

  // Public routes render immediately
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Protected routes wait for auth state
  // This prevents flash of protected content
  if (isLoading) {
    return null;
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <HeaderWrapper />
      <AuthGate>{children}</AuthGate>
    </AuthProvider>
  );
}
