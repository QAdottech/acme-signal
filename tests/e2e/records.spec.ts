import { test, expect } from "./fixtures";

test("RECORDS-01: edit a deal's stage and owner inline, filter, bulk-update, and switch views", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Deals", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Deals", exact: true })).toBeVisible();

  // Inline stage edit keeps you on the list and updates probability.
  const row = page.getByRole("row").filter({ hasText: "Platform Integration" });
  await row.getByRole("button", { name: /^Stage: Qualified/ }).click();
  await page.getByRole("menuitem", { name: "Negotiation" }).click();
  await expect(page).toHaveURL(/\/deals$/);
  await expect(row).toContainText("Negotiation");
  await expect(row).toContainText("75%");

  // Inline owner edit.
  await row.getByRole("button", { name: /^Owner: / }).click();
  await page.getByRole("menuitem", { name: "Michael Chen" }).click();
  await expect(row).toContainText("Michael Chen");

  // Both edits survive a reload.
  await page.reload();
  await expect(row).toContainText("Negotiation");
  await expect(row).toContainText("Michael Chen");

  // Filter by stage: the chip appears and only matching rows remain.
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Negotiation", { exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Remove Stage filter" })).toBeVisible();
  const negotiation = page.getByRole("row").filter({ hasText: "Negotiation" });
  await expect(negotiation).toHaveCount(2);
  await expect(page.getByText("2 deals", { exact: true })).toBeVisible();

  // Bulk-move both to Proposal.
  await page.getByRole("checkbox", { name: "Select all" }).check();
  await expect(page.getByText("2 deals selected")).toBeVisible();
  await page.getByRole("button", { name: "Set stage" }).click();
  await page.getByRole("menuitem", { name: "Proposal" }).click();
  await expect(page.getByRole("row").filter({ hasText: "Negotiation" })).toHaveCount(0);
  await page.getByRole("button", { name: "Remove Stage filter" }).click();
  await expect(row).toContainText("Proposal");
  await expect(row).toContainText("50%");

  // Board and table are two views of the same deals.
  await page.getByRole("link", { name: "Board", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sales Pipeline" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Proposal deals", exact: true }).getByRole("heading", { name: "Platform Integration" })
  ).toBeVisible();
  await page.getByRole("link", { name: "Table", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Deals", exact: true })).toBeVisible();
});
