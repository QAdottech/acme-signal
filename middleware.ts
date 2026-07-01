import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BASIC_AUTH_USERNAME = "username";
const BASIC_AUTH_PASSWORD = "p4ssw0rd";
const BASIC_AUTH_REALM = "Protected Area";

// Routes that don't require authentication
const publicRoutes = [
  "/login",
  "/signup",
  "/verify-email",
  "/customer/sign",
  "/bot-test/user-agent",
  "/turnstile-test",
  "/basic-auth",
];

/** Crawl / QA sandbox + robots (must not redirect to login). */
function isPublicCrawlPath(pathname: string) {
  return pathname === "/robots.txt" || pathname.startsWith("/bot-test");
}

// Routes that authenticated users should be redirected away from
const authRoutes = ["/login", "/signup"];

function isBasicAuthPath(pathname: string) {
  return pathname === "/basic-auth" || pathname.startsWith("/basic-auth/");
}

function validateBasicAuth(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Basic ")) {
    return false;
  }

  const credentials = atob(authHeader.slice(6));
  const separatorIndex = credentials.indexOf(":");
  if (separatorIndex === -1) {
    return false;
  }

  const username = credentials.slice(0, separatorIndex);
  const password = credentials.slice(separatorIndex + 1);

  return (
    username === BASIC_AUTH_USERNAME && password === BASIC_AUTH_PASSWORD
  );
}

function basicAuthChallenge() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${BASIC_AUTH_REALM}"`,
    },
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isBasicAuthPath(pathname) && !validateBasicAuth(request)) {
    return basicAuthChallenge();
  }

  // Check for auth cookie
  const authCookie = request.cookies.get("auth-token");
  const isAuthenticated = !!authCookie?.value;

  // Check if current path is public
  const isPublicRoute =
    publicRoutes.includes(pathname) || isPublicCrawlPath(pathname);

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
