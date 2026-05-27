import { Metadata } from "next";
import { TurnstileTestClient } from "./turnstile-test-client";

export const metadata: Metadata = {
  title: "Turnstile test",
  description: "Cloudflare Turnstile protected form demo",
};

export default function TurnstileTestPage() {
  return <TurnstileTestClient />;
}
