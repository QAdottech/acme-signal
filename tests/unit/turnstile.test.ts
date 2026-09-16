// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { verifyTurnstileToken } from "@/lib/turnstile";

describe("Turnstile verification boundary", () => {
  it("fails closed without a secret and makes no network request", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);
    vi.spyOn(console, "warn").mockImplementation(() => {});

    expect(await verifyTurnstileToken("test-token")).toEqual({ success: false, errorCodes: ["missing-secret"] });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("posts the token and IP as form data to Cloudflare", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-only-secret");
    const fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true })));
    vi.stubGlobal("fetch", fetch);

    expect(await verifyTurnstileToken("test-token", "192.0.2.1")).toEqual({ success: true });
    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ secret: "test-only-secret", response: "test-token", remoteip: "192.0.2.1" }),
      },
    );
  });

  it("returns challenge rejection codes instead of a success-shaped fallback", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-only-secret");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, "error-codes": ["timeout-or-duplicate"] }))));
    expect(await verifyTurnstileToken("expired-token")).toEqual({ success: false, errorCodes: ["timeout-or-duplicate"] });
  });

  it("propagates a network failure to the caller", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "test-only-secret");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network unavailable")));
    await expect(verifyTurnstileToken("test-token")).rejects.toThrow("Network unavailable");
  });
});
