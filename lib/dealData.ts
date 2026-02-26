import type { Deal } from "@/types/deal";
import type { DealStage } from "@/types/organization";

const defaultDeals: Deal[] = [
  {
    id: "d1",
    title: "Enterprise License",
    organizationId: "3",
    value: 24000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-04-15",
    owner: "Emma Wilson",
    probability: 20,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d2",
    title: "Platform Integration",
    organizationId: "4",
    value: 120000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: "2026-05-01",
    owner: "David Martinez",
    probability: 40,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d3",
    title: "Team Plan Upgrade",
    organizationId: "5",
    value: 36000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-04-30",
    owner: "Sarah Johnson",
    probability: 15,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d4",
    title: "Contract Automation Suite",
    organizationId: "9",
    value: 85000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: "2026-05-15",
    owner: "Sarah Johnson",
    probability: 45,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d5",
    title: "Startup Plan",
    organizationId: "10",
    value: 18000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-06-01",
    owner: "Emma Wilson",
    probability: 25,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d6",
    title: "Analytics Platform License",
    organizationId: "11",
    value: 42000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-05-20",
    owner: "Michael Chen",
    probability: 20,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d7",
    title: "AI Research Partnership",
    organizationId: "12",
    value: 500000,
    currency: "USD",
    stage: "Proposal",
    expectedCloseDate: "2026-04-01",
    owner: "David Martinez",
    probability: 60,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d8",
    title: "E-commerce Integration",
    organizationId: "13",
    value: 55000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-06-15",
    owner: "Sarah Johnson",
    probability: 15,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d9",
    title: "ML Platform License",
    organizationId: "16",
    value: 200000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: "2026-05-10",
    owner: "David Martinez",
    probability: 35,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d10",
    title: "Satellite Monitoring Add-on",
    organizationId: "18",
    value: 30000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-07-01",
    owner: "Emma Wilson",
    probability: 10,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d11",
    title: "Biotech Research License",
    organizationId: "19",
    value: 45000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-06-20",
    owner: "Michael Chen",
    probability: 15,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d12",
    title: "Payment Platform Pilot",
    organizationId: "20",
    value: 15000,
    currency: "USD",
    stage: "New",
    expectedCloseDate: "2026-07-15",
    owner: "David Martinez",
    probability: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d13",
    title: "Legal AI Integration",
    organizationId: "21",
    value: 60000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: "2026-05-25",
    owner: "Sarah Johnson",
    probability: 40,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d14",
    title: "Developer Tools Bundle",
    organizationId: "23",
    value: 150000,
    currency: "USD",
    stage: "Negotiation",
    expectedCloseDate: "2026-03-15",
    owner: "Emma Wilson",
    probability: 75,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d15",
    title: "Search Infrastructure Deal",
    organizationId: "24",
    value: 250000,
    currency: "USD",
    stage: "Proposal",
    expectedCloseDate: "2026-04-20",
    owner: "David Martinez",
    probability: 55,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d16",
    title: "Research Platform License",
    organizationId: "25",
    value: 35000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-06-10",
    owner: "Sarah Johnson",
    probability: 20,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "d17",
    title: "Vercel Edge Network Expansion",
    organizationId: "4",
    value: 75000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: "2026-07-01",
    owner: "Emma Wilson",
    probability: 15,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function getDeals(): Deal[] {
  const stored = localStorage.getItem("deals");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultDeals;
    }
  }
  localStorage.setItem("deals", JSON.stringify(defaultDeals));
  return defaultDeals;
}

export function getDeal(id: string): Deal | undefined {
  return getDeals().find((d) => d.id === id);
}

export function getDealsForOrganization(organizationId: string): Deal[] {
  return getDeals().filter((d) => d.organizationId === organizationId);
}

export function saveDeal(deal: Deal): Deal {
  const deals = getDeals();
  const index = deals.findIndex((d) => d.id === deal.id);
  if (index >= 0) {
    deals[index] = deal;
  } else {
    deals.push(deal);
  }
  localStorage.setItem("deals", JSON.stringify(deals));
  return deal;
}

export function addDeal(
  deal: Omit<Deal, "id" | "createdAt">
): Deal {
  const newDeal: Deal = {
    ...deal,
    id: "d" + Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  const deals = getDeals();
  deals.push(newDeal);
  localStorage.setItem("deals", JSON.stringify(deals));
  return newDeal;
}

export function deleteDeal(dealId: string): void {
  const deals = getDeals().filter((d) => d.id !== dealId);
  localStorage.setItem("deals", JSON.stringify(deals));
}

export function saveDeals(deals: Deal[]): void {
  localStorage.setItem("deals", JSON.stringify(deals));
}

export function formatDealValue(value: number, currency: string = "USD"): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value}`;
}

export function getTotalPipelineValue(): number {
  const pipelineStages: DealStage[] = ["New", "Lead", "Qualified", "Proposal", "Negotiation"];
  return getDeals()
    .filter((d) => pipelineStages.includes(d.stage))
    .reduce((sum, d) => sum + d.value, 0);
}

export function getWeightedPipelineValue(): number {
  const pipelineStages: DealStage[] = ["New", "Lead", "Qualified", "Proposal", "Negotiation"];
  return getDeals()
    .filter((d) => pipelineStages.includes(d.stage))
    .reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
}
