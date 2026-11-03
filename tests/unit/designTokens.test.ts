import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "..", "..");

/** Files allowed to use orange: categorical colours and the public signing page. */
const ALLOWED = new Set([
  "app/customer/sign/sign-client.tsx",
  "app/tasks/tasks-client.tsx", // "High" priority colour
  "app/notifications/notifications-client.tsx", // stage-change activity icon
  "app/organizations/[id]/organization-detail-client.tsx", // stage-change activity icon
  "components/activity-feed.tsx", // stage-change activity icon
  "components/deal-card.tsx", // avatar palette
]);

function tsxFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return tsxFiles(path);
    return path.endsWith(".tsx") ? [path] : [];
  });
}

describe("design tokens", () => {
  it("keeps brand orange out of UI chrome (buttons, focus rings, links)", () => {
    const offenders = [...tsxFiles(join(root, "app")), ...tsxFiles(join(root, "components"))]
      .map((path) => relative(root, path))
      .filter((path) => !ALLOWED.has(path))
      .filter((path) => /\b(?:bg|text|ring|border)-orange-\d/.test(readFileSync(join(root, path), "utf8")));
    expect(offenders).toEqual([]);
  });
});
