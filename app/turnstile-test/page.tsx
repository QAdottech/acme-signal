import { Metadata } from "next";
import { headers } from "next/headers";
import { TurnstileTestClient } from "./turnstile-test-client";

export const metadata: Metadata = {
  title: "Turnstile test",
  description: "Cloudflare Turnstile protected form demo",
};

export const dynamic = "force-dynamic";

export default function TurnstileTestPage() {
  const userAgent = headers().get("user-agent") ?? "";
  return <TurnstileTestClient serverUserAgent={userAgent} />;
}
