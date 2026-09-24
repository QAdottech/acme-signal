import { test as base, expect, type Page } from "@playwright/test";

// Existing demo user is seeded in each fresh browser context; no real account is created.
export const account = {
  email: "james.morrison@example.com",
  password: "testingpassword",
};

export async function signIn(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sales Pipeline" })).toBeVisible();
}

export async function logOut(page: Page) {
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Log out" }).click();
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
}

export const test = base.extend<{ signedInPage: Page }>({
  signedInPage: async ({ page }, use) => {
    await signIn(page);
    await use(page);
  },
});

export { expect };
