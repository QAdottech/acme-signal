import { describe, expect, it } from "vitest";
import { getDeals } from "@/lib/dealData";
import { getOrganizations, getCollections } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { getTasks } from "@/lib/taskData";
import { getNotes } from "@/lib/notesData";
import { getEmails } from "@/lib/emailData";
import { getActivities } from "@/lib/activityData";
import { ASSIGNEES, OWNERS } from "@/lib/team";

/**
 * The demo data is what every demo and QA run starts from, so its
 * cross-references must hold: a deal's contacts work at the deal's company,
 * every id points at something real, and nothing collides.
 */
describe("seed data integrity", () => {
  const orgs = getOrganizations();
  const people = getPeople();
  const deals = getDeals();
  const orgIds = new Set(orgs.map((o) => o.id));
  const personById = new Map(people.map((p) => [p.id, p]));
  const dealIds = new Set(deals.map((d) => d.id));
  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name;

  it.each([
    ["companies", orgs],
    ["people", people],
    ["deals", deals],
    ["tasks", getTasks()],
    ["notes", getNotes()],
    ["emails", getEmails()],
    ["activities", getActivities()],
    ["lists", getCollections()],
  ] as const)("%s have unique ids", (_name, records) => {
    const ids = (records as { id: string }[]).map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("every deal belongs to a real company and its contacts work there", () => {
    for (const deal of deals) {
      expect(orgIds.has(deal.organizationId), deal.id).toBe(true);
      for (const contactId of deal.contactIds ?? []) {
        const person = personById.get(contactId);
        expect(person, `${deal.id} contact ${contactId}`).toBeDefined();
        expect(person?.organization, `${deal.title} contact ${person?.name}`).toBe(orgName(deal.organizationId));
      }
      expect(OWNERS as readonly string[]).toContain(deal.owner);
    }
  });

  it("every company has at least one contact", () => {
    const withPeople = new Set(people.map((p) => p.organization));
    expect(orgs.filter((o) => !withPeople.has(o.name)).map((o) => o.name)).toEqual([]);
  });

  it("the pipeline has open, won and lost deals so boards and reports aren't empty", () => {
    const stages = new Set(deals.map((d) => d.stage));
    for (const stage of ["New", "Lead", "Qualified", "Proposal", "Negotiation", "Customer", "Closed Lost"]) {
      expect(stages.has(stage as never), stage).toBe(true);
    }
  });

  it("tasks point at real records and every demo login has some", () => {
    const tasks = getTasks();
    for (const task of tasks) {
      if (task.relatedDealId) expect(dealIds.has(task.relatedDealId), task.id).toBe(true);
      if (task.relatedOrganizationId) expect(orgIds.has(task.relatedOrganizationId), task.id).toBe(true);
      if (task.relatedPersonId) expect(personById.has(task.relatedPersonId), task.id).toBe(true);
      expect(ASSIGNEES as readonly string[]).toContain(task.assignee);
      if (task.status === "done") expect(task.completedAt, task.id).toBeTruthy();
    }
    for (const user of ["James Morrison", "Elena Vasquez", "Sarah Chen"]) {
      expect(tasks.some((t) => t.assignee === user), user).toBe(true);
    }
  });

  it("notes, emails and activity point at real records", () => {
    for (const note of getNotes()) {
      if (note.organizationId) expect(orgIds.has(note.organizationId), note.id).toBe(true);
      if (note.personId) expect(personById.has(note.personId), note.id).toBe(true);
      if (note.dealId) expect(dealIds.has(note.dealId), note.id).toBe(true);
    }
    for (const email of getEmails()) {
      if (email.relatedOrganizationId) expect(orgIds.has(email.relatedOrganizationId), email.id).toBe(true);
      if (email.relatedPersonId) {
        expect(personById.get(email.relatedPersonId)?.email, email.id).toBe(email.to);
      }
    }
    for (const activity of getActivities()) {
      if (activity.relatedEntityType === "organization" && activity.relatedEntityId) {
        expect(orgIds.has(activity.relatedEntityId), activity.id).toBe(true);
      }
    }
  });

  it("emails and activity are filed under the company they are about", () => {
    const problems: string[] = [];
    for (const email of getEmails()) {
      if (!email.relatedOrganizationId) continue;
      const org = orgs.find((o) => o.id === email.relatedOrganizationId);
      if (!org) {
        problems.push(`email ${email.id}: unknown company ${email.relatedOrganizationId}`);
        continue;
      }
      const person = email.relatedPersonId ? personById.get(email.relatedPersonId) : undefined;
      if (email.relatedPersonId && person?.organization !== org.name) {
        problems.push(`email ${email.id}: contact ${person?.name} is not at ${org.name}`);
      }
      // A subject naming another company means it was filed under the wrong one.
      const named = orgs.find((o) => o.id !== org.id && email.subject.includes(o.name));
      if (named) problems.push(`email ${email.id} "${email.subject}" is filed under ${org.name}`);
    }
    for (const activity of getActivities()) {
      if (activity.relatedEntityType !== "organization" || !activity.relatedEntityId) continue;
      const name = orgName(activity.relatedEntityId);
      if (!name) {
        problems.push(`activity ${activity.id}: unknown company ${activity.relatedEntityId}`);
        continue;
      }
      const text = `${activity.title} ${activity.description}`;
      const named = orgs.find((o) => o.id !== activity.relatedEntityId && text.includes(o.name) && !text.includes(name));
      if (named) problems.push(`activity ${activity.id} "${activity.description}" is filed under ${name}`);
    }
    expect(problems).toEqual([]);
  });
});
