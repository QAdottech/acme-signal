import { test, expect, account, logOut, signUp } from "./fixtures";

test("AUTH-01: protected routes redirect to login; invalid credentials stay rejected", async ({ page }) => {
  await page.goto("/people");
  await expect(page).toHaveURL(/\/login\?from=%2Fpeople$/);
  await page.getByLabel("Email", { exact: true }).fill("unknown@example.test");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Invalid email or password", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login\?from=%2Fpeople$/);
});

test("AUTH-02: signup, logout, login redirect, and session persistence", async ({ page }) => {
  await signUp(page);
  await logOut(page);

  await page.goto("/people");
  await expect(page).toHaveURL(/\/login\?from=%2Fpeople$/);
  await page.getByLabel("Email", { exact: true }).fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/people$/);
  await expect(page.getByRole("heading", { name: "People", exact: true })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "People", exact: true })).toBeVisible();
  await logOut(page);
  await page.goto("/people");
  await expect(page).toHaveURL(/\/login\?from=%2Fpeople$/);
});
