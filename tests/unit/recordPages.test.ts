import { describe, expect, it } from "vitest";
import { buildTimeline } from "@/lib/timeline";
import {
  deleteOrganization,
  getCollections,
  getOrganization,
  setOrganizationLists,
  updateOrganization,
} from "@/lib/organizationData";
import { addNote, getNotesForPerson } from "@/lib/notesData";
import { getPerson, updatePerson } from "@/lib/personData";
import type { Task } from "@/types/task";

describe("buildTimeline", () => {
  it("merges notes, tasks and emails newest first", () => {
    const items = buildTimeline({
      notes: [{ id: "n", organizationId: "1", content: "Hi", authorName: "Ann", createdAt: "2026-01-02T00:00:00Z", updatedAt: "" }],
      tasks: [
        { id: "t", title: "Call", status: "done", priority: "low", createdAt: "2026-01-01T00:00:00Z", completedAt: "2026-01-05T00:00:00Z" } as Task,
      ],
      emails: [{ id: "e", to: "a@b.c", toName: "Bo", subject: "Re: pricing", status: "sent", type: "outreach", sentAt: "2026-01-03T00:00:00Z" }],
      created: { timestamp: "2025-12-31T00:00:00Z", title: "Created" },
    });
    expect(items.map((i) => i.id)).toEqual(["task-t", "email-e", "note-n", "created"]);
    expect(items[0]).toMatchObject({ title: "Task completed: Call", done: true });
    expect(items[1]).toMatchObject({ title: "Email sent to Bo", body: "Re: pricing" });
  });

  it("drops items with invalid timestamps", () => {
    expect(buildTimeline({ created: { timestamp: "not a date", title: "x" } })).toEqual([]);
  });
});

describe("company helpers", () => {
  it("updates one company and leaves the rest alone", () => {
    const before = getOrganization("2");
    const updated = updateOrganization("1", { owner: "Emma Wilson" });
    expect(updated?.owner).toBe("Emma Wilson");
    expect(getOrganization("1")?.owner).toBe("Emma Wilson");
    expect(getOrganization("2")).toEqual(before);
  });

  it("keeps list membership in sync on both sides", () => {
    setOrganizationLists("1", ["3"]);
    expect(getOrganization("1")?.collections).toEqual(["3"]);
    const lists = getCollections();
    expect(lists.find((l) => l.id === "3")?.organizationIds).toContain("1");
    expect(lists.filter((l) => l.id !== "3").every((l) => !l.organizationIds.includes("1"))).toBe(true);

    setOrganizationLists("1", []);
    expect(getCollections().some((l) => l.organizationIds.includes("1"))).toBe(false);
  });

  it("removes a deleted company from every list", () => {
    setOrganizationLists("1", ["1", "3"]);
    deleteOrganization("1");
    expect(getOrganization("1")).toBeUndefined();
    expect(getCollections().some((l) => l.organizationIds.includes("1"))).toBe(false);
  });
});

describe("person helpers", () => {
  it("updates a person and finds notes written about them", () => {
    expect(updatePerson("1", { role: "Chief Explorer" })?.role).toBe("Chief Explorer");
    expect(getPerson("1")?.role).toBe("Chief Explorer");
    addNote({ organizationId: "", personId: "1", content: "Met at conf", authorName: "Ann" });
    expect(getNotesForPerson("1").map((n) => n.content)).toEqual(["Met at conf"]);
  });
});

describe("list helpers", () => {
  it("create, add, remove and delete keep both sides of membership in sync", async () => {
    const { createList, addCompaniesToList, removeCompaniesFromList, deleteList, getList } = await import(
      "@/lib/organizationData"
    );
    const list = createList({ name: "QA list", description: "", tags: [] });
    addCompaniesToList(list.id, ["1", "2"]);
    expect(getList(list.id)?.organizationIds.sort()).toEqual(["1", "2"]);
    expect(getOrganization("1")?.collections).toContain(list.id);

    addCompaniesToList(list.id, ["1"]); // no duplicates
    expect(getList(list.id)?.organizationIds.filter((id) => id === "1")).toHaveLength(1);

    removeCompaniesFromList(list.id, ["1"]);
    expect(getList(list.id)?.organizationIds).toEqual(["2"]);
    expect(getOrganization("1")?.collections).not.toContain(list.id);

    deleteList(list.id);
    expect(getList(list.id)).toBeUndefined();
    expect(getOrganization("2")?.collections).not.toContain(list.id);
  });
});
