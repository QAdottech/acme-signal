"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Deterministic value so verifyNetworkRequest can assert name + value. */
export const NETWORK_TEST_REQUEST_ID = "qa-tech-network-test-request-id";
export const NETWORK_TEST_CUSTOM_HEADER_VALUE = "custom-header-ok";

type Status = "idle" | "loading" | "success" | "error";

export function NetworkTestClient() {
  const [status, setStatus] = useState<Status>("idle");
  const [feedback, setFeedback] = useState("");
  const [echoedRequestId, setEchoedRequestId] = useState<string | null>(null);

  const sendRequest = async () => {
    setStatus("loading");
    setFeedback("");
    setEchoedRequestId(null);

    try {
      const response = await fetch("/api/network-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Request-Id": NETWORK_TEST_REQUEST_ID,
          "X-QA-Tech-Test-Header": NETWORK_TEST_CUSTOM_HEADER_VALUE,
        },
        body: JSON.stringify({ source: "network-test-page" }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        received?: { requestId?: string };
      };

      if (!response.ok || !data.success) {
        setStatus("error");
        setFeedback(data.error ?? "Request failed");
        return;
      }

      setStatus("success");
      setEchoedRequestId(data.received?.requestId ?? null);
      setFeedback("Custom request headers were sent and accepted by the API.");
    } catch {
      setStatus("error");
      setFeedback("Network error — try again.");
    }
  };

  return (
    <main className="mx-auto max-w-md space-y-6 px-6 py-12 font-sans">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Network header test
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Click the button to send a browser{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">fetch</code> to{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            /api/network-test
          </code>{" "}
          with custom outgoing headers. Use this page to validate{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            verifyNetworkRequest
          </code>{" "}
          header assertions.
        </p>
      </div>

      <div className="space-y-2 rounded-md border border-border bg-muted/40 p-4 text-sm">
        <p className="font-medium">Headers sent</p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>
            <code>X-Request-Id: {NETWORK_TEST_REQUEST_ID}</code>
          </li>
          <li>
            <code>
              X-QA-Tech-Test-Header: {NETWORK_TEST_CUSTOM_HEADER_VALUE}
            </code>
          </li>
        </ul>
      </div>

      <Button
        type="button"
        onClick={sendRequest}
        disabled={status === "loading"}
        data-testid="send-custom-header-request"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="animate-spin" />
            Sending…
          </>
        ) : (
          "Send request with custom headers"
        )}
      </Button>

      {feedback && (
        <div
          className={
            status === "success"
              ? "rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
              : "rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400"
          }
          data-testid="network-test-result"
        >
          <p>{feedback}</p>
          {echoedRequestId && (
            <p className="mt-1">
              Echoed <code>X-Request-Id</code>:{" "}
              <span data-testid="echoed-request-id">{echoedRequestId}</span>
            </p>
          )}
        </div>
      )}
    </main>
  );
}
