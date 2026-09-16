import { test, expect } from "./fixtures";

test("TASKS-01: create an overdue task, complete it, and retain completion after reload", async ({ signedInPage: page }) => {
  await page.clock.setFixedTime(new Date("2026-06-01T12:00:00Z"));
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await page.getByRole("button", { name: "Add Task", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Create Task" });
  await expect(dialog.getByRole("button", { name: "Create Task", exact: true })).toBeDisabled();
  await dialog.getByLabel("Title", { exact: false }).fill("QA Follow Up");
  await dialog.getByLabel("Due Date").fill("2026-05-31");
  await dialog.getByRole("button", { name: "Create Task", exact: true }).click();
  await expect(dialog).toBeHidden();

  await page.getByPlaceholder("Search tasks...").fill("QA Follow Up");
  await page.getByRole("tab", { name: /Overdue/ }).click();
  const row = page.getByRole("row").filter({ hasText: "QA Follow Up" });
  await expect(row).toContainText("To Do");
  await expect(row).toContainText("(overdue)");
  // The completed row immediately leaves this filter, so check() cannot re-read it.
  await row.getByRole("checkbox").click();
  await expect(row).toHaveCount(0);
  await expect(page.getByText("No overdue tasks found matching your search.")).toBeVisible();

  await page.reload();
  await page.getByPlaceholder("Search tasks...").fill("QA Follow Up");
  await expect(row).toContainText("Done");
  await expect(row.getByRole("checkbox")).toBeChecked();
  await expect(row).not.toContainText("(overdue)");
  await page.getByRole("tab", { name: /Overdue/ }).click();
  await expect(row).toHaveCount(0);
});
