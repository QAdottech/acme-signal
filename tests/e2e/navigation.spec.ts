import { test, expect } from "./fixtures";

test("NAV-01: the command menu finds records, creates from anywhere, and G shortcuts navigate", async ({ signedInPage: page }) => {
  // Search opens a record and only shows real matches.
  await page.getByRole("button", { name: "Search", exact: true }).click();
  const menu = page.getByRole("dialog", { name: "Command menu" });
  await menu.getByRole("combobox").fill("anthro");
  await expect(menu.getByRole("option", { name: /QA\.tech/ })).toHaveCount(0);
  await menu.getByRole("option", { name: /^Anthropic/ }).click();
  await expect(page).toHaveURL(/\/organizations\/12$/);
  await expect(page.getByRole("heading", { name: "Anthropic", exact: true })).toBeVisible();

  // A create action on another page navigates there and opens its modal.
  await page.keyboard.press("ControlOrMeta+k");
  await menu.getByRole("combobox").fill("create task");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/tasks$/);
  const createTask = page.getByRole("dialog", { name: "Create Task" });
  await expect(createTask).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(createTask).toHaveCount(0);

  // "G then D" goes to Deals; shortcuts are ignored while typing.
  await page.keyboard.press("g");
  await page.keyboard.press("d");
  await expect(page).toHaveURL(/\/deals$/);
  await page.getByPlaceholder("Search deals...").fill("gp");
  await expect(page).toHaveURL(/\/deals$/);
});
