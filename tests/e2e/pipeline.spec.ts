import { test, expect } from "./fixtures";

test("DEALS-01: create a deal, drag it to Qualified, and verify persistence in the deal list", async ({ signedInPage: page }) => {
  await page.getByRole("button", { name: "Add Deal", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Create Deal" });
  await dialog.getByLabel("Title", { exact: true }).fill("QA Pipeline Deal");
  await dialog.getByRole("combobox", { name: "Company", exact: true }).click();
  await page.getByRole("option", { name: "Spotify", exact: true }).click();
  await dialog.getByLabel("Value ($)", { exact: true }).fill("12000");
  await dialog.getByLabel("Close Date").fill("2027-06-01");
  await dialog.getByRole("combobox", { name: "Owner", exact: true }).click();
  await page.getByRole("option", { name: "Emma Wilson", exact: true }).click();
  await dialog.getByRole("button", { name: "Create Deal", exact: true }).click();
  await expect(dialog).toBeHidden();

  await page.getByPlaceholder("Filter deals...").fill("QA Pipeline Deal");
  const lead = page.getByRole("region", { name: "Lead deals", exact: true });
  const qualified = page.getByRole("region", { name: "Qualified deals", exact: true });
  const card = lead.getByRole("button", { name: /QA Pipeline Deal/ });
  await expect(card).toBeVisible();

  // dnd-kit uses pointer events and an 8px activation distance, not HTML5 drag events.
  const source = await card.boundingBox();
  const target = await qualified.boundingBox();
  if (!source || !target) throw new Error("Pipeline card or Qualified drop zone is not visible");
  await page.mouse.move(source.x + source.width / 2, source.y + source.height / 2);
  await page.mouse.down();
  await page.mouse.move(source.x + source.width / 2 + 10, source.y + source.height / 2);
  await page.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 10 });
  await page.mouse.up();
  await expect(qualified.getByRole("heading", { name: "QA Pipeline Deal" })).toBeVisible();
  await expect(lead.getByRole("heading", { name: "QA Pipeline Deal" })).toHaveCount(0);

  await page.reload();
  await page.getByPlaceholder("Filter deals...").fill("QA Pipeline Deal");
  await expect(qualified.getByRole("heading", { name: "QA Pipeline Deal" })).toBeVisible();
  await page.getByRole("link", { name: "Deals", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "QA Pipeline Deal" });
  await expect(row).toContainText("Qualified");
  await expect(row).toContainText("30%");
  await expect(row).toContainText("$12K");
  await expect(row).toContainText("Spotify");
});
