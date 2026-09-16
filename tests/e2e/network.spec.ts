import { test, expect } from "./fixtures";

test("NETWORK-01: the browser sends custom headers and the real API echoes them", async ({ page }) => {
  await page.goto("/network-test");
  const responsePromise = page.waitForResponse(response =>
    response.url().endsWith("/api/network-test") && response.request().method() === "POST",
  );
  await page.getByRole("button", { name: "Send request with custom headers" }).click();
  const response = await responsePromise;
  expect(response.status()).toBe(200);
  const request = response.request();
  expect(await request.headerValue("X-Request-Id")).toBe("qa-tech-network-test-request-id");
  expect(await request.headerValue("X-QA-Tech-Test-Header")).toBe("custom-header-ok");
  expect(await response.json()).toEqual({
    success: true,
    received: {
      requestId: "qa-tech-network-test-request-id",
      customHeader: "custom-header-ok",
      body: { source: "network-test-page" },
    },
  });
  await expect(page.getByText("Custom request headers were sent and accepted by the API.")).toBeVisible();
  await expect(page.getByTestId("echoed-request-id")).toHaveText("qa-tech-network-test-request-id");
});
