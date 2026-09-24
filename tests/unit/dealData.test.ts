import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDeal,
  deleteDeal,
  getDeal,
  getDeals,
  getDealsForOrganization,
  getTotalPipelineValue,
  getWeightedPipelineValue,
  saveDeal,
  saveDeals,
} from "@/lib/dealData";
import type { Deal } from "@/types/deal";

const input: Omit<Deal, "id" | "createdAt"> = {
  title: "Enterprise pilot",
  organizationId: "company-a",
  value: 10000,
  currency: "USD",
  stage: "Lead",
  expectedCloseDate: "2026-07-01",
  owner: "Test owner",
  probability: 20,
};

describe("deal persistence", () => {
  beforeEach(() => saveDeals([]));

  it("creates a deal with an ID and timestamp, then reads it back", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-01T12:00:00Z"));

    const created = addDeal(input);

    expect(created).toEqual({
      ...input,
      id: expect.any(String),
      createdAt: "2026-06-01T12:00:00.000Z",
    });
    expect(created.id).not.toBe("");
    expect(getDeal(created.id)).toEqual(created);
    expect(getDeals()).toEqual([created]);
  });

  it("updates without duplicating a deal and preserves other deals", () => {
    const first = addDeal(input);
    const second = addDeal({ ...input, organizationId: "company-b" });
    const updated = { ...first, title: "Updated pilot", value: 25000 };

    saveDeal(updated);

    expect(getDeals()).toEqual([updated, second]);
    expect(getDealsForOrganization("company-a")).toEqual([updated]);
    expect(getDealsForOrganization("missing")).toEqual([]);
  });

  it("inserts a previously unknown deal via saveDeal", () => {
    const deal: Deal = { ...input, id: "imported", createdAt: "2026-06-01T00:00:00Z" };
    saveDeal(deal);
    expect(getDeals()).toEqual([deal]);
  });

  it("deletes only the selected deal; deleting an unknown ID is harmless", () => {
    const first = addDeal(input);
    const second = addDeal(input);
    deleteDeal(first.id);
    deleteDeal("missing");
    expect(getDeal(first.id)).toBeUndefined();
    expect(getDeals()).toEqual([second]);
  });

  it("does not replace an intentionally empty store with demo data", () => {
    expect(getDeals()).toEqual([]);
  });
});

describe("pipeline metrics", () => {
  it("sums open stages, weights each deal's probability, and excludes closed deals", () => {
    saveDeals([]);
    addDeal({ ...input, stage: "New", value: 1000, probability: 5 });
    addDeal({ ...input, stage: "Lead", value: 2000, probability: 20 });
    addDeal({ ...input, stage: "Qualified", value: 3000, probability: 40 });
    addDeal({ ...input, stage: "Proposal", value: 4000, probability: 60 });
    addDeal({ ...input, stage: "Negotiation", value: 5000, probability: 80 });
    addDeal({ ...input, stage: "Customer", value: 100000, probability: 100 });
    addDeal({ ...input, stage: "Closed Lost", value: 200000, probability: 0 });
    addDeal({ ...input, stage: "Churned", value: 300000, probability: 100 });

    expect(getTotalPipelineValue()).toBe(15000);
    expect(getWeightedPipelineValue()).toBe(8050);
  });

  it("returns zero for an empty pipeline", () => {
    saveDeals([]);
    expect(getTotalPipelineValue()).toBe(0);
    expect(getWeightedPipelineValue()).toBe(0);
  });
});
