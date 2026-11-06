import { test, expect, type Page } from "@playwright/test";
import { signIn } from "../e2e/fixtures";

/**
 * Screenshot baselines for the main demo screens. Opt-in (not part of
 * `pnpm test:e2e`): run `pnpm test:visual` to compare, and
 * `pnpm test:visual:update` after an intentional design change.
 *
 * The clock is pinned so relative seed dates ("2d ago", "closes Dec 8")
 * render identically on every run.
 */
const FIXED_NOW = new Date("2026-11-04T10:00:00Z");

async function open(page: Page, path: string) {
  await page.clock.setFixedTime(FIXED_NOW);
  await signIn(page);
  if (path !== "/") await page.goto(path);
  await page.waitForLoadState("networkidle");
  // Let fonts and logos settle.
  await page.evaluate(() => document.fonts.ready);
}

const screens: [name: string, path: string, ready: string][] = [
  ["pipeline-board", "/", "Sales Pipeline"],
  ["deals-table", "/deals", "Deals"],
  ["companies-table", "/organizations", "Companies"],
  ["people-table", "/people", "People"],
  ["company-page", "/organizations/12", "Anthropic"],
  ["deal-page", "/deals/d7", "AI Research Partnership"],
  ["inbox", "/inbox", "Inbox"],
  ["tasks-table", "/tasks", "Tasks"],
  ["lists-table", "/collections", "Lists"],
  ["list-page", "/collections/2", "Stockholm Startups"],
  ["settings", "/settings", "Settings"],
  ["team", "/team", "Team"],
  ["reports", "/reports", "Reports"],
  ["report-pipeline", "/reports/pipeline-overview", "Pipeline Overview"],
  ["report-revenue", "/reports/revenue-deals", "Revenue & Deals"],
  ["report-contacts", "/reports/contacts-companies", "Contacts & Companies"],
];

for (const [name, path, heading] of screens) {
  test(`${name} looks right`, async ({ page }) => {
    await open(page, path);
    await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
    await expect(page).toHaveScreenshot(`${name}.png`);
  });
}

test("command menu looks right", async ({ page }) => {
  await open(page, "/organizations");
  await page.keyboard.press("ControlOrMeta+k");
  await page.getByRole("dialog", { name: "Command menu" }).getByRole("combobox").fill("an");
  await expect(page).toHaveScreenshot("command-menu.png");
});

test("login looks right", async ({ page }) => {
  await page.clock.setFixedTime(FIXED_NOW);
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("login.png");
});

test("create deal dialog looks right", async ({ page }) => {
  await open(page, "/deals");
  await page.getByRole("button", { name: "Add Deal", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Create Deal" })).toBeVisible();
  await expect(page).toHaveScreenshot("create-deal-dialog.png");
});
