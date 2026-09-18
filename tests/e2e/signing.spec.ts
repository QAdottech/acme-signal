import { test, expect } from "./fixtures";

test("SIGN-01: public proposal requires a name and both consents before showing confirmation", async ({ page }) => {
  await page.goto("/customer/sign?customer_name=QA%20Customer&deal_name=QA%20Proposal&amount=12000");
  await expect(page).toHaveURL(/\/customer\/sign\?/);
  await page.getByRole("button", { name: "Sign proposal", exact: true }).click();
  await expect(page.getByText("Full name is required.", { exact: true })).toBeVisible();
  await expect(page.getByText("You must agree to the Terms of Service.", { exact: true })).toBeVisible();
  await expect(page.getByText("You must confirm you are authorized to sign.", { exact: true })).toBeVisible();

  await page.getByLabel("Your full name", { exact: true }).fill("QA Signer");
  await page.getByRole("checkbox", { name: /I agree to the Proposal/ }).check();
  await page.getByRole("button", { name: "Sign proposal", exact: true }).click();
  await expect(page.getByText("You must confirm you are authorized to sign.", { exact: true })).toBeVisible();
  await expect(page.getByText("Signed!", { exact: true })).toHaveCount(0);

  await page.getByRole("checkbox", { name: /I am authorized to sign/ }).check();
  await page.getByRole("button", { name: "Sign proposal", exact: true }).click();
  await expect(page.getByText("Signed!", { exact: true })).toBeVisible();
  await expect(page.getByText("Thank you. Your signature has been recorded.", { exact: true })).toBeVisible();
});
