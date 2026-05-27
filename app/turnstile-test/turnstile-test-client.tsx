"use client";

import { useCallback, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export function TurnstileTestClient() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [feedback, setFeedback] = useState("");

  const renderWidget = useCallback(() => {
    if (!siteKey || !window.turnstile) return;

    const container = document.getElementById("turnstile-widget");
    if (!container || container.childElementCount > 0) return;

    const id = window.turnstile.render(container, {
      sitekey: siteKey,
      theme: "auto",
      callback: (token) => setTurnstileToken(token),
      "expired-callback": () => setTurnstileToken(null),
      "error-callback": () => setTurnstileToken(null),
    });
    setWidgetId(id);
  }, []);

  const handleScriptLoad = () => {
    window.onTurnstileLoad = renderWidget;
    renderWidget();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setFeedback("");

    try {
      const response = await fetch("/api/turnstile-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message, turnstileToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus("error");
        setFeedback(data.error ?? "Submission failed");
        if (widgetId && window.turnstile) {
          window.turnstile.reset(widgetId);
        }
        setTurnstileToken(null);
        return;
      }

      setStatus("success");
      setFeedback(`Thanks, ${data.received.name}! Your message was accepted.`);
      setName("");
      setMessage("");
      setTurnstileToken(null);
      if (widgetId && window.turnstile) {
        window.turnstile.reset(widgetId);
      }
    } catch {
      setStatus("error");
      setFeedback("Network error — try again.");
    }
  };

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
      />
      <main className="mx-auto max-w-md px-6 py-12">
          <h1 className="text-2xl font-semibold tracking-tight">
            Turnstile test
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit the form only after the Cloudflare challenge succeeds.
            Server-side verification runs on{" "}
            <code className="rounded bg-muted px-1 text-xs">
              /api/turnstile-test
            </code>
            .
          </p>

          {!siteKey && (
            <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
              Set{" "}
              <code className="text-xs">NEXT_PUBLIC_TURNSTILE_SITE_KEY</code> in{" "}
              <code className="text-xs">.env.local</code> to render the widget.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Hello from Turnstile"
                rows={4}
                required
              />
            </div>

            <div id="turnstile-widget" className="min-h-[65px]" />

            <Button
              type="submit"
              className="w-full"
              disabled={!siteKey || !turnstileToken || status === "loading"}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying…
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </form>

          {feedback && (
            <p
              className={`mt-4 text-sm ${
                status === "success"
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
              role="status"
            >
              {feedback}
            </p>
          )}
      </main>
    </>
  );
}
