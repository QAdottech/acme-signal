import { test, expect } from "./fixtures";

test("REPORTS-01: create a custom report, reload its widgets, and delete it", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Reports", exact: true }).click();
  await page.getByRole("button", { name: "Add report" }).click();
  await page.getByRole("dialog", { name: "Create Report" })
    .getByRole("button", { name: /Pipeline by Stage/ }).click();
  const configure = page.getByRole("dialog", { name: "Configure Report" });
  await configure.getByLabel("Report Title").fill("QA Sales Review");
  await configure.getByLabel("Description", { exact: true }).fill("Test pipeline report");
  await configure.getByRole("button", { name: "Create Report", exact: true }).click();
  await expect(page).toHaveURL(/\/reports\/report-/);
  await expect(page.getByRole("heading", { name: "QA Sales Review" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "QA Sales Review" })).toBeVisible();
  await expect(page.getByText("Deals by Stage", { exact: true })).toBeVisible();
  await expect(page.getByText("Total Pipeline Value", { exact: true })).toBeVisible();
  await expect(page.getByText("Total Deal Count", { exact: true })).toBeVisible();
  await expect(page.getByText(/\d+ active deals/)).toBeVisible();
  await page.getByRole("button", { name: "Delete report", exact: true }).click();
  await page.getByRole("dialog", { name: "Delete Report" }).getByRole("button", { name: "Delete", exact: true }).click();
  await expect(page).toHaveURL(/\/reports$/);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Reports", exact: true })).toBeVisible();
  await expect(page.getByText("QA Sales Review", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Pipeline Overview", { exact: true })).toBeVisible();
});
