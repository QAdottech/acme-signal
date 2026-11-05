import { test, expect, account, logOut, signIn } from "./fixtures";

test("AUTH-01: protected routes redirect to login; invalid credentials stay rejected", async ({ page }) => {
  await page.goto("/people");
  await expect(page).toHaveURL(/\/login\?from=%2Fpeople$/);
  await page.getByLabel("Email", { exact: true }).fill("unknown@example.test");
  await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByText("Invalid email or password", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/login\?from=%2Fpeople$/);
});

test("AUTH-02: demo login, logout, return-path login, and session persistence", async ({ page }) => {
  await signIn(page);
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

test("AUTH-03: the post-login return path only accepts same-site paths", async ({ page }) => {
  // "/\\example.org" is the backslash bypass QA.tech found: browsers read "\" as "/".
  for (const from of ["//example.com", "https://example.com/phish", "/\\example.org"]) {
    await page.goto(`/login?from=${encodeURIComponent(from)}`);
    await page.getByLabel("Email", { exact: true }).fill(account.email);
    await page.getByLabel("Password", { exact: true }).fill(account.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Sales Pipeline" })).toBeVisible();
    expect(new URL(page.url()).origin).toBe("http://localhost:3100");
    await logOut(page);
  }
});
