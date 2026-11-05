import { test, expect } from "./fixtures";

test("LISTS-02: a list is a company table you add to and remove from", async ({ signedInPage: page }) => {
  await page.goto("/collections");
  await page.getByRole("button", { name: "New List", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "New List" });
  await dialog.getByLabel("Name").fill("QA Nordics");
  await dialog.getByLabel("Description").fill("Companies for the QA demo");
  await dialog.getByRole("button", { name: "Create List" }).click();

  // Creating a list opens it, and it appears in the sidebar.
  await expect(page.getByRole("heading", { name: "QA Nordics", exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "QA Nordics" })).toBeVisible();
  await expect(page.getByText("No companies in this list yet.")).toBeVisible();

  // Add two companies from the picker.
  await page.getByRole("button", { name: "Add companies" }).click();
  await page.getByPlaceholder("Search companies to add...").fill("Klarna");
  await page.getByRole("option", { name: /Klarna/ }).click();
  await page.getByPlaceholder("Search companies to add...").fill("Spotify");
  await page.getByRole("option", { name: /Spotify/ }).click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("row").filter({ hasText: "Klarna" })).toHaveCount(1);
  await expect(page.getByRole("row").filter({ hasText: "Spotify" })).toHaveCount(1);

  // Membership shows on the company page too.
  await page.getByRole("row").filter({ hasText: "Klarna" }).getByRole("link", { name: "Klarna" }).click();
  const details = page.getByRole("complementary", { name: "Record details" });
  await expect(details.getByRole("button", { name: "Remove from QA Nordics" })).toBeVisible();
  await page.goBack();

  // Remove one; it leaves the list but the company still exists.
  await page.getByRole("row").filter({ hasText: "Spotify" }).getByRole("checkbox").check();
  await page.getByRole("button", { name: "Remove from list" }).click();
  await expect(page.getByRole("row").filter({ hasText: "Spotify" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("row").filter({ hasText: "Klarna" })).toHaveCount(1);
  await expect(page.getByRole("row").filter({ hasText: "Spotify" })).toHaveCount(0);

  // Delete the list from its edit dialog.
  await page.getByRole("button", { name: "Edit", exact: true }).click();
  await page.getByRole("dialog", { name: "Edit List" }).getByRole("button", { name: "Delete List" }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Delete list" }).click();
  await expect(page).toHaveURL(/\/collections$/);
  await expect(page.getByRole("row").filter({ hasText: "QA Nordics" })).toHaveCount(0);
  await page.goto("/organizations");
  await expect(page.getByRole("row").filter({ hasText: "Spotify" })).toHaveCount(1);
});

test("TASKS-03: tasks edit inline and in a preview, and completing one can be undone", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "Draft Vercel partnership agreement" });

  // Inline status and priority.
  await row.getByRole("button", { name: /^Status: / }).click();
  await page.getByRole("menuitem", { name: "In Progress" }).click();
  await expect(row).toContainText("In Progress");
  await row.getByRole("button", { name: /^Priority: / }).click();
  await page.getByRole("menuitem", { name: "Urgent" }).click();
  await expect(row).toContainText("Urgent");

  // Preview: change the assignee; the table follows.
  await row.getByRole("cell").filter({ hasText: "Vercel" }).first().click({ position: { x: 4, y: 4 } });
  const preview = page.getByRole("dialog", { name: "Draft Vercel partnership agreement" });
  await expect(preview).toBeVisible();
  await expect(preview.getByText("Work with legal to draft")).toBeVisible();
  await preview.getByRole("button", { name: /^Assignee: / }).click();
  await page.getByRole("menuitem", { name: "Sarah Johnson" }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await page.keyboard.press("Escape");
  await expect(row).toContainText("Sarah Johnson");

  // Complete, then undo from the toast.
  await row.getByRole("checkbox").click();
  await expect(row.getByRole("checkbox")).toBeChecked();
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(row.getByRole("checkbox")).not.toBeChecked();
  await expect(row).toContainText("In Progress");

  await page.reload();
  await expect(row).toContainText("In Progress");
  await expect(row).toContainText("Urgent");
  await expect(row).toContainText("Sarah Johnson");
});

test("TASKS-04: completing from the task preview can be undone, and Undo works while the preview is open", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  const title = "Schedule technical demo for Cursor";
  const row = page.getByRole("row").filter({ hasText: title });
  const stored = () =>
    page.evaluate((t) => JSON.parse(localStorage.getItem("tasks") ?? "[]").find((task: { title: string }) => task.title === t)?.status, title);

  // Complete from inside the preview: the toast offers Undo, and Undo works
  // even though the preview (a modal) is still open.
  await row.getByRole("cell").first().click({ position: { x: 4, y: 4 } });
  const preview = page.getByRole("dialog", { name: title });
  await preview.getByRole("checkbox", { name: `Complete ${title}` }).click();
  await expect(preview.getByRole("checkbox")).toBeChecked();
  expect(await stored()).toBe("done");

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(preview.getByRole("checkbox")).not.toBeChecked();
  expect(await stored()).toBe("todo");
  // Clicking the toast must not have closed the preview.
  await expect(preview).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(row.getByRole("checkbox")).not.toBeChecked();
  await page.reload();
  await expect(row.getByRole("checkbox")).not.toBeChecked();
});

test("TASKS-05: Undo stays available long enough for a slow click", async ({ signedInPage: page }) => {
  await page.getByRole("link", { name: "Tasks", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "Prepare Perplexity onboarding docs" });
  await row.getByRole("checkbox").click();
  await expect(row.getByRole("checkbox")).toBeChecked();
  // The default 4s toast had already gone by the time QA.tech's agent clicked.
  await page.waitForTimeout(6_000);
  await page.getByRole("button", { name: "Undo" }).click();
  await expect(row.getByRole("checkbox")).not.toBeChecked();
});
