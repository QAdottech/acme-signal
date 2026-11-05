import { test, expect, account, logOut, signIn } from "./fixtures";

test("DEMO-01: demo bugs switch on from a link and off from Settings", async ({ signedInPage: page }) => {
  // Off by default: values are exact.
  await page.goto("/deals");
  const row = page.getByRole("row").filter({ hasText: "Biotech Research License" });
  await expect(row).toContainText("$45K");

  // A demo link turns the rounding bug on.
  await page.goto("/deals?demoBugs=value-rounding");
  await expect(row).toContainText("$40K");

  // Settings shows it on and can turn it off again.
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  const toggle = page.getByRole("switch", { name: "Deal values round down" });
  await expect(toggle).toBeChecked();
  await expect(page.getByText("1 of 8 on")).toBeVisible();
  await toggle.click();
  await expect(page.getByText("No bugs on")).toBeVisible();

  await page.goto("/deals");
  await expect(row).toContainText("$45K");
});

test("DEMO-02: reset demo data restores the seeded workspace", async ({ signedInPage: page }) => {
  await page.goto("/deals");
  const row = page.getByRole("row").filter({ hasText: "Startup Plan" });
  await row.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete deal" }).click();
  await expect(row).toHaveCount(0);

  await page.goto("/settings");
  await page.getByRole("button", { name: "Reset", exact: true }).click();
  await page.getByRole("alertdialog", { name: "Reset demo data?" }).getByRole("button", { name: "Reset data" }).click();
  await expect(page.getByRole("heading", { name: "Sales Pipeline" })).toBeVisible();
  await expect(page.getByText("Demo data reset")).toBeVisible();

  await page.goto("/deals");
  await expect(row).toHaveCount(1);
});

test("INBOX-01: notifications and sent emails share one inbox", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: /^Inbox/ }).click();
  await expect(page.getByRole("heading", { name: "Inbox", exact: true })).toBeVisible();

  // Old URLs land in the inbox.
  await page.goto("/notifications");
  await expect(page).toHaveURL(/\/inbox$/);
  await page.goto("/emails");
  await expect(page).toHaveURL(/\/inbox\?view=emails$/);
  await expect(page.getByRole("button", { name: "Sent emails" })).toHaveAttribute("aria-pressed", "true");

  // Opening an email shows it on the right.
  await page.getByRole("option", { name: /Proposal: Enterprise License/ }).click();
  const message = page.getByRole("region", { name: "Message" });
  await expect(message.getByRole("heading", { name: "Proposal: Enterprise License" })).toBeVisible();
  await expect(message.getByRole("link", { name: "Dario Amodei" })).toBeVisible();

  // Reading a notification clears its unread state; "mark all" clears the rest.
  await page.getByRole("button", { name: /^Unread/ }).click();
  const unread = page.getByRole("option");
  const before = await unread.count();
  expect(before).toBeGreaterThan(1);
  await unread.first().click();
  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: /^Unread/ }).click();
  await expect(unread).toHaveCount(before - 1);
  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(page.getByText("No unread notifications.")).toBeVisible();
});

test("DEMO-03: one demo link resets data and sets bugs, even when it has to go through login", async ({ page }) => {
  // Make a change that a reset should undo.
  await signIn(page);
  await page.goto("/deals");
  const row = page.getByRole("row").filter({ hasText: "Startup Plan" });
  await row.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete deal" }).click();
  await expect(row).toHaveCount(0);
  await logOut(page);

  // The agent's start URL: logged out, so it goes through login first.
  await page.goto("/deals?resetDemo=1&demoBugs=value-rounding");
  await expect(page).toHaveURL(/\/login\?from=/);
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();

  await expect(page).toHaveURL(/\/deals(\?reset=1)?$/);
  await expect(row).toHaveCount(1);
  await expect(page.getByRole("row").filter({ hasText: "Biotech Research License" })).toContainText("$40K");

  // Reloading must not reset again: a new edit survives.
  await row.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete deal" }).click();
  await expect(row).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "Payment Platform Pilot" })).toHaveCount(1);
  await expect(row).toHaveCount(0);
});

test("LISTS-01: list cards are single links with separate company links inside", async ({ signedInPage: page }) => {
  await page.goto("/collections");
  await expect(page.getByRole("heading", { name: "Lists", exact: true })).toBeVisible();
  // Links nested in links are invalid HTML and break hydration.
  await expect(page.locator("a a")).toHaveCount(0);
  await page.getByRole("link", { name: "Stockholm Startups", exact: true }).first().click();
  await expect(page).toHaveURL(/\/collections\/\w+$/);
});
