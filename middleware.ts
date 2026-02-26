import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that don't require authentication
const publicRoutes = ["/login", "/signup", "/verify-email", "/customer/sign"];

// Routes that authenticated users should be redirected away from
const authRoutes = ["/login", "/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth cookie
  const authCookie = request.cookies.get("auth-token");
  const isAuthenticated = !!authCookie?.value;

  // Check if current path is public
  const isPublicRoute = publicRoutes.includes(pathname);

  // Check if current path is an auth page (login/signup)
  const isAuthRoute = authRoutes.includes(pathname);

  // If not authenticated and trying to access protected route, redirect to login
  if (!isAuthenticated && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    // Preserve the original URL to redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If authenticated and trying to access auth pages, redirect to home (pipeline)
  if (isAuthenticated && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logos|placeholder).*)",
  ],
};
