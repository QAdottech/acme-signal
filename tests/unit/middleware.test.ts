// @vitest-environment node
import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";

const origin = "http://localhost:3100";

describe("page authentication middleware", () => {
  it("redirects anonymous visitors to login and preserves the requested path", () => {
    const response = middleware(new NextRequest(`${origin}/deals/deal-a`));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${origin}/login?from=%2Fdeals%2Fdeal-a`);
  });

  it.each(["/login", "/signup", "/verify-email", "/customer/sign", "/network-test", "/turnstile-test", "/bot-test/docs", "/robots.txt"])(
    "allows anonymous access to %s", (path) => {
      const response = middleware(new NextRequest(`${origin}${path}`));
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(response.headers.get("location")).toBeNull();
    },
  );

  it("allows a demo session to access the CRM", () => {
    const response = middleware(new NextRequest(`${origin}/people`, {
      headers: { cookie: "auth-token=test-user" },
    }));
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it.each(["/login", "/signup"])("redirects signed-in visitors away from %s", (path) => {
    const response = middleware(new NextRequest(`${origin}${path}`, {
      headers: { cookie: "auth-token=test-user" },
    }));
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(`${origin}/`);
  });

  it("challenges Basic Auth visitors even with a CRM session", () => {
    const response = middleware(new NextRequest(`${origin}/basic-auth`, {
      headers: { cookie: "auth-token=test-user" },
    }));
    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe('Basic realm="Protected Area"');
  });
});
