import type { Deal, DealHealth } from "@/types/deal";
import type { DealStage } from "@/types/organization";

const CLOSED_STAGES: DealStage[] = ["Customer", "Churned", "Closed Lost"];
const STALE_AFTER_DAYS = 14;
const CLOSING_SOON_DAYS = 14;

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function todayIsoDate(): string {
  return dateOffset(0);
}

const defaultDeals: Deal[] = [
  {
    id: "d1",
    title: "Enterprise License",
    organizationId: "3",
    value: 24000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(-12),
    owner: "Emma Wilson",
    probability: 20,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Scoping call with CTO next Tuesday",
    tags: ["Pre POC", "Enterprise"],
    contactIds: ["3", "7"],
    lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "email",
  },
  {
    id: "d2",
    title: "Platform Integration",
    organizationId: "4",
    value: 120000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: dateOffset(45),
    owner: "David Martinez",
    probability: 40,
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Technical architecture review with engineering team",
    tags: ["Technical Eval", "Enterprise"],
    contactIds: ["5", "9"],
    lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "meeting",
  },
  {
    id: "d3",
    title: "Team Plan Upgrade",
    organizationId: "5",
    value: 36000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(40),
    owner: "Sarah Johnson",
    probability: 15,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Send pricing comparison document",
    tags: ["Expansion"],
    contactIds: ["6"],
    lastActivityDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "email",
  },
  {
    id: "d4",
    title: "Contract Automation Suite",
    organizationId: "9",
    value: 85000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: dateOffset(6),
    owner: "Sarah Johnson",
    probability: 45,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Demo for legal operations team on Thursday",
    tags: ["POC", "Champion Identified"],
    contactIds: ["14"],
    lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "call",
  },
  {
    id: "d5",
    title: "Startup Plan",
    organizationId: "10",
    value: 18000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(55),
    owner: "Emma Wilson",
    probability: 25,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Follow up on trial activation",
    tags: ["Startup", "Pre POC"],
    contactIds: ["10"],
    lastActivityDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "email",
  },
  {
    id: "d6",
    title: "Analytics Platform License",
    organizationId: "11",
    value: 42000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(30),
    owner: "Michael Chen",
    probability: 20,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Schedule product walkthrough with VP Eng",
    tags: ["Pre POC", "Technical Eval"],
    contactIds: ["11"],
    lastActivityDate: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "note",
  },
  {
    id: "d7",
    title: "AI Research Partnership",
    organizationId: "12",
    value: 500000,
    currency: "USD",
    stage: "Proposal",
    expectedCloseDate: dateOffset(-18),
    owner: "David Martinez",
    probability: 60,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Finalize SOW and send for legal review",
    tags: ["Enterprise", "Champion Identified", "POC Complete"],
    contactIds: ["8", "12"],
    lastActivityDate: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "meeting",
  },
  {
    id: "d8",
    title: "E-commerce Integration",
    organizationId: "13",
    value: 55000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(70),
    owner: "Sarah Johnson",
    probability: 15,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Intro call with head of engineering",
    tags: ["Pre POC"],
    contactIds: ["13"],
    lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "email",
  },
  {
    id: "d9",
    title: "ML Platform License",
    organizationId: "16",
    value: 200000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: dateOffset(11),
    owner: "David Martinez",
    probability: 35,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "POC environment setup and data migration plan",
    tags: ["POC", "Enterprise", "Technical Eval"],
    contactIds: ["16"],
    lastActivityDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "meeting",
  },
  {
    id: "d10",
    title: "Satellite Monitoring Add-on",
    organizationId: "18",
    value: 30000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(50),
    owner: "Emma Wilson",
    probability: 10,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Send case study from similar deployment",
    tags: ["Startup"],
    contactIds: ["18"],
    lastActivityDate: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "email",
  },
  {
    id: "d11",
    title: "Biotech Research License",
    organizationId: "19",
    value: 45000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(-8),
    owner: "Michael Chen",
    probability: 15,
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Prepare compliance documentation for review",
    tags: ["Pre POC", "Technical Eval"],
    contactIds: ["15"],
    lastActivityDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "note",
  },
  {
    id: "d12",
    title: "Payment Platform Pilot",
    organizationId: "20",
    value: 15000,
    currency: "USD",
    stage: "New",
    expectedCloseDate: dateOffset(80),
    owner: "David Martinez",
    probability: 5,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Initial discovery call scheduled for next Monday",
    tags: ["Startup", "Pre POC"],
    contactIds: ["4"],
    lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "task",
  },
  {
    id: "d13",
    title: "Legal AI Integration",
    organizationId: "21",
    value: 60000,
    currency: "USD",
    stage: "Qualified",
    expectedCloseDate: dateOffset(9),
    owner: "Sarah Johnson",
    probability: 40,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Security questionnaire and SOC 2 review",
    tags: ["POC", "Champion Identified"],
    contactIds: ["14", "2"],
    lastActivityDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "call",
  },
  {
    id: "d14",
    title: "Developer Tools Bundle",
    organizationId: "23",
    value: 150000,
    currency: "USD",
    stage: "Negotiation",
    expectedCloseDate: dateOffset(-4),
    owner: "Emma Wilson",
    probability: 75,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Final contract redlines from their legal team",
    tags: ["Enterprise", "POC Complete", "Champion Identified"],
    contactIds: ["12", "8"],
    lastActivityDate: new Date(Date.now() - 0.25 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "meeting",
  },
  {
    id: "d15",
    title: "Search Infrastructure Deal",
    organizationId: "24",
    value: 250000,
    currency: "USD",
    stage: "Proposal",
    expectedCloseDate: dateOffset(28),
    owner: "David Martinez",
    probability: 55,
    createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Present revised pricing to procurement",
    tags: ["Enterprise", "POC Complete"],
    contactIds: ["11", "1"],
    lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "email",
  },
  {
    id: "d16",
    title: "Research Platform License",
    organizationId: "25",
    value: 35000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(60),
    owner: "Sarah Johnson",
    probability: 20,
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Share API documentation and sandbox access",
    tags: ["Pre POC", "Startup"],
    contactIds: ["13", "18"],
    lastActivityDate: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "email",
  },
  {
    id: "d17",
    title: "Vercel Edge Network Expansion",
    organizationId: "4",
    value: 75000,
    currency: "USD",
    stage: "Lead",
    expectedCloseDate: dateOffset(48),
    owner: "Emma Wilson",
    probability: 15,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    nextStep: "Benchmark current vs proposed infrastructure costs",
    tags: ["Expansion", "Renewal"],
    contactIds: ["5", "9"],
    lastActivityDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    lastActivityType: "call",
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

export const STAGE_PROBABILITIES: Record<string, number> = {
  New: 5,
  Lead: 15,
  Qualified: 30,
  Proposal: 50,
  Negotiation: 75,
  Customer: 100,
  "Closed Lost": 0,
};

export const DEAL_HEALTH_LABELS: Record<DealHealth, string> = {
  overdue: "Overdue",
  stale: "Stale",
  closing_soon: "Closing soon",
  on_track: "On track",
};

export const DEAL_HEALTH_BAR_COLORS: Record<DealHealth, string> = {
  overdue: "border-l-red-500",
  stale: "border-l-amber-500",
  closing_soon: "border-l-sky-500",
  on_track: "border-l-emerald-500",
};

export const DEAL_HEALTH_BADGE_CLASSES: Record<DealHealth, string> = {
  overdue: "bg-red-100 text-white dark:bg-red-900/30 dark:text-white",
  stale: "bg-amber-100 text-white dark:bg-amber-900/30 dark:text-white",
  closing_soon: "bg-sky-100 text-white dark:bg-sky-900/30 dark:text-white",
  on_track: "bg-emerald-100 text-white dark:bg-emerald-900/30 dark:text-white",
};

export function getDealHealth(deal: Deal): DealHealth {
  if (CLOSED_STAGES.includes(deal.stage)) {
    return "on_track";
  }

  const close = deal.expectedCloseDate.slice(0, 10);
  const today = todayIsoDate();

  if (close < today) {
    return "overdue";
  }

  if (deal.lastActivityDate) {
    const daysSinceActivity =
      (Date.now() - new Date(deal.lastActivityDate).getTime()) /
      (1000 * 60 * 60 * 24);
    if (daysSinceActivity >= STALE_AFTER_DAYS) {
      return "stale";
    }
  } else {
    return "stale";
  }

  const closeDate = new Date(`${close}T12:00:00`);
  const todayDate = new Date(`${today}T12:00:00`);
  const daysUntilClose = Math.round(
    (closeDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilClose <= CLOSING_SOON_DAYS) {
    return "closing_soon";
  }

  return "on_track";
}
