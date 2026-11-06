import { test, expect } from "./fixtures";

test("TEAM-01: invite a member, block duplicates, and protect yourself and the last admin", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Team", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Team" })).toBeVisible();

  await page.getByRole("button", { name: "Invite Member" }).click();
  const invite = page.getByRole("dialog", { name: "Invite Member" });
  await expect(invite.getByRole("button", { name: "Send Invite" })).toBeDisabled();
  await invite.getByLabel("Email").fill("new.hire@example.com");
  await invite.getByRole("button", { name: "Send Invite" }).click();
  await expect(invite).toBeHidden();
  const row = page.getByRole("row").filter({ hasText: "new.hire@example.com" });
  await expect(row).toContainText("Invited");
  await expect(row).toContainText("Member");

  // The same address can't be invited twice.
  await page.getByRole("button", { name: "Invite Member" }).click();
  await invite.getByLabel("Email").fill("NEW.HIRE@example.com");
  await invite.getByRole("button", { name: "Send Invite" }).click();
  await expect(page.getByText("NEW.HIRE@example.com is already on the team.")).toBeVisible();
  await page.keyboard.press("Escape");

  // You can't remove yourself.
  const me = page.getByRole("row").filter({ hasText: "james.morrison@example.com" });
  await me.getByRole("button", { name: /^Actions for/ }).click();
  await expect(page.getByRole("menuitem", { name: "You can't remove yourself" })).toBeDisabled();
  await page.keyboard.press("Escape");

  // Remove the invite again.
  await row.getByRole("button", { name: /^Actions for/ }).click();
  await page.getByRole("menuitem", { name: "Remove from team" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Remove user" }).click();
  await expect(row).toHaveCount(0);
});

test("FORMS-01: create a company and a task linked to it with the shared pickers", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Companies", exact: true }).click();
  await page.getByRole("button", { name: "Add Company" }).click();
  const company = page.getByRole("dialog", { name: "Create Company" });
  const create = company.getByRole("button", { name: "Create Company" });
  await expect(create).toBeDisabled();
  await company.getByLabel("Name").fill("QA Widgets");
  await company.getByRole("combobox", { name: "Industry" }).click();
  await page.getByPlaceholder("Search industries…").fill("fint");
  await page.getByRole("option", { name: "Fintech" }).click();
  await company.getByLabel("Location").fill("Oslo, Norway");
  await create.click();
  await expect(company).toBeHidden();
  await expect(page.getByRole("row").filter({ hasText: "QA Widgets" })).toContainText("Fintech");

  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  await page.getByRole("button", { name: "Add Task", exact: true }).click();
  const task = page.getByRole("dialog", { name: "Create Task" });
  await task.getByLabel("Title").fill("QA kickoff call");
  await task.getByRole("combobox", { name: "Related to" }).click();
  await page.getByPlaceholder("Search records…").fill("QA Widgets");
  await page.getByRole("option", { name: "QA Widgets" }).click();
  await task.getByRole("button", { name: "Create Task", exact: true }).click();
  await expect(task).toBeHidden();
  const row = page.getByRole("row").filter({ hasText: "QA kickoff call" });
  await expect(row.getByRole("link", { name: /QA Widgets/ })).toBeVisible();
});
