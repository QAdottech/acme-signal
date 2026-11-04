import { test, expect } from "./fixtures";

test("RECORDS-02: preview a company from its row, edit it there, then add a note and list on its page", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Companies", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "Hugging Face" });

  // Clicking the row (not the name link) opens a preview instead of navigating.
  await row.getByRole("cell").filter({ hasText: "New York" }).click();
  const preview = page.getByRole("dialog", { name: "Hugging Face" });
  await expect(preview).toBeVisible();
  await expect(page).toHaveURL(/\/organizations$/);

  // Editing in the preview updates the table behind it.
  await preview.getByRole("button", { name: /^Owner: / }).click();
  await page.getByRole("menuitem", { name: "Emma Wilson" }).click();
  await expect(preview.getByRole("button", { name: /^Owner: Emma Wilson/ })).toBeVisible();
  // Let the owner menu finish closing so Escape reaches the preview.
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(preview).toBeHidden();
  await expect(row).toContainText("Emma Wilson");

  // Open the full page from the preview.
  await row.getByRole("cell").filter({ hasText: "New York" }).click();
  await preview.getByRole("link", { name: "Open" }).click();
  await expect(page).toHaveURL(/\/organizations\/\d+$/);
  await expect(page.getByRole("heading", { name: "Hugging Face", exact: true })).toBeVisible();
  const details = page.getByRole("complementary", { name: "Record details" });
  await expect(details.getByRole("button", { name: /^Owner: Emma Wilson/ })).toBeVisible();

  // Notes written on the page show in the Notes tab and the activity feed, and persist.
  await page.getByRole("tab", { name: /^Notes/ }).click();
  await page.getByLabel("New note").fill("QA follow-up: send the SOC 2 report");
  await page.getByRole("button", { name: "Save note" }).click();
  await expect(page.getByText("QA follow-up: send the SOC 2 report")).toBeVisible();

  // Add the company to a list from the sidebar.
  await details.getByRole("button", { name: "Add to list" }).click();
  await page.getByRole("menuitem", { name: "Developer Tools" }).click();
  await expect(details.getByRole("button", { name: "Remove from Developer Tools" })).toBeVisible();

  await page.reload();
  await page.getByRole("tab", { name: /^Activity/ }).click();
  await expect(page.getByText("QA follow-up: send the SOC 2 report")).toBeVisible();
  await expect(details.getByRole("button", { name: "Remove from Developer Tools" })).toBeVisible();

  // The list itself now contains the company.
  await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Developer Tools" }).click();
  await expect(page.getByText("Hugging Face", { exact: true }).first()).toBeVisible();
});

test("RECORDS-03: a person has their own page, reachable from the command menu", async ({ signedInPage: page }) => {
  await page.keyboard.press("ControlOrMeta+k");
  await page.getByRole("dialog", { name: "Command menu" }).getByRole("combobox").fill("Dario");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/people\/\w+$/);
  await expect(page.getByRole("heading", { name: "Dario Amodei", exact: true })).toBeVisible();
  await expect(page.getByText("CEO at Anthropic")).toBeVisible();

  // Their deals are listed and link to the deal page.
  await page.getByRole("tab", { name: /^Deals/ }).click();
  await page.getByRole("link", { name: /AI Research Partnership/ }).click();
  await expect(page.getByRole("heading", { name: "AI Research Partnership", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Deals", exact: true }).first().click();
  await expect(page).toHaveURL(/\/deals$/);
});

test("RECORDS-04: unknown record links show a not-found state", async ({ signedInPage: page }) => {
  await page.goto("/deals/does-not-exist");
  await expect(page.getByRole("heading", { name: "This deal doesn't exist" })).toBeVisible();
  await page.getByRole("link", { name: "Back to Deals" }).click();
  await expect(page).toHaveURL(/\/deals$/);
});
