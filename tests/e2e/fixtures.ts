import { test as base, expect, type Page } from "@playwright/test";

// Synthetic account created through the UI in each fresh browser context.
export const account = {
  email: "playwright@example.test",
  password: "test-only-password-123",
  name: "Playwright Tester",
};

export async function signUp(page: Page) {
  await page.goto("/signup");
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByLabel("Confirm Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.getByLabel("Full Name").fill(account.name);
  await page.getByRole("button", { name: "Complete Signup" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await page.getByRole("link", { name: "Continue to ACME Signal" }).click();
  await expect(page.getByRole("heading", { name: "Sales Pipeline" })).toBeVisible();
}

export async function logOut(page: Page) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
}

export const test = base.extend<{ signedInPage: Page }>({
  signedInPage: async ({ page }, use) => {
    await signUp(page);
    await use(page);
  },
});

export { expect };
