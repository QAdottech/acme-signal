"use client";

import { useAuth } from "@/lib/auth-context";
import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { PublicHeader } from "@/components/public-header";

const publicRoutes = ["/login", "/signup"];

export function HeaderWrapper() {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();

  const isPublicRoute = !pathname || publicRoutes.includes(pathname);

  // Public routes always get PublicHeader
  if (isPublicRoute) {
    return <PublicHeader />;
  }

  // Protected routes: show SiteHeader if we have user OR still loading
  // (middleware ensures only authenticated users reach protected routes)
  if (user || isLoading) {
    return <SiteHeader />;
  }

  // Edge case: no user after loading on protected route
  // Middleware should have redirected, but show public header as fallback
  return <PublicHeader />;
}
