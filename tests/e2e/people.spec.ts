import { readFile } from "node:fs/promises";
import { test, expect } from "./fixtures";

test("PEOPLE-01: create, edit, search, and delete a contact; changes survive reloads", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "People", exact: true }).click();
  await page.getByRole("button", { name: "Add Person", exact: true }).click();
  const add = page.getByRole("dialog", { name: "Add New Person" });
  await add.getByLabel("Name", { exact: true }).fill("QA Contact");
  await add.getByLabel("Email", { exact: true }).fill("contact@example.test");
  await add.getByLabel("Role", { exact: true }).fill("Engineer");
  await add.getByLabel("Organization", { exact: true }).fill("Test Company");
  await add.getByRole("button", { name: "Add Person", exact: true }).click();
  await expect(add).toBeHidden();

  await page.reload();
  await page.getByPlaceholder("Search people...").fill("contact@example.test");
  const row = page.getByRole("row").filter({ hasText: "contact@example.test" });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText("QA Contact");
  await expect(row).toContainText("Engineer");
  // The name opens the person's page, where the full edit form lives.
  await row.getByRole("link", { name: "QA Contact" }).click();
  await expect(page.getByRole("heading", { name: "QA Contact", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  const edit = page.getByRole("dialog", { name: "Edit Person" });
  await edit.getByLabel("Role", { exact: true }).fill("Engineering Manager");
  await edit.getByRole("button", { name: "Save Changes" }).click();
  await expect(edit).toBeHidden();
  await expect(page.getByText("Engineering Manager at Test Company")).toBeVisible();

  await page.goto("/people");
  await page.getByPlaceholder("Search people...").fill("contact@example.test");
  await expect(row).toContainText("Engineering Manager");
  await row.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  const confirmation = page.getByRole("alertdialog", { name: "Delete 1 contact?" });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole("button", { name: "Delete contact" }).click();
  await expect(row).toHaveCount(0);

  await page.reload();
  await page.getByPlaceholder("Search people...").fill("contact@example.test");
  await expect(page.getByText("No people found matching your criteria.")).toBeVisible();
  // Deleting the new contact must not delete the seeded contacts.
  await page.getByPlaceholder("Search people...").fill("Daniel Ek");
  await expect(page.getByRole("row").filter({ hasText: "Daniel Ek" })).toHaveCount(1);
});

test("PEOPLE-02: CSV export contains only the filtered contacts", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "People", exact: true }).click();
  await page.getByPlaceholder("Search people...").fill("Daniel Ek");
  await expect(page.getByRole("row").filter({ hasText: "Daniel Ek" })).toHaveCount(1);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV", exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^people-\d{4}-\d{2}-\d{2}\.csv$/);
  const path = await download.path();
  if (!path) throw new Error("CSV download did not produce a local file");
  const csv = await readFile(path, "utf8");
  expect(csv.split("\n")).toHaveLength(2);
  expect(csv).toContain("name,email,role,organization");
  expect(csv).toContain("Daniel Ek,daniel@spotify.com,CEO,Spotify");
  expect(csv).not.toContain("Sarah Chen");
});
