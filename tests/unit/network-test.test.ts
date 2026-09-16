// @vitest-environment node
import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/network-test/route";

function request(headers: Record<string, string> = {}) {
  return new Request("http://localhost:3100/api/network-test", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: JSON.stringify({ source: "unit-test" }),
  });
}

describe("network test API", () => {
  it("echoes accepted request headers and the body", async () => {
    const response = await POST(request({
      "X-Request-Id": "request-123", "X-QA-Tech-Test-Header": "header-value",
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      received: { requestId: "request-123", customHeader: "header-value", body: { source: "unit-test" } },
    });
  });

  it.each<Record<string, string>>([{}, { "X-Request-Id": "   " }])("rejects a missing or blank request ID: %j", async (headers) => {
    const response = await POST(request(headers));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ success: false, error: "Missing X-Request-Id request header" });
  });
});
