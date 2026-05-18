import type { DealStage } from "@/types/organization";

export const PIPELINE_STAGES: { id: string; name: DealStage }[] = [
  { id: "new", name: "New" },
  { id: "lead", name: "Lead" },
  { id: "qualified", name: "Qualified" },
  { id: "proposal", name: "Proposal" },
  { id: "negotiation", name: "Negotiation" },
  { id: "customer", name: "Customer" },
  { id: "churned", name: "Churned" },
  { id: "closed-lost", name: "Closed Lost" },
];

export const ALL_STAGE_NAMES: DealStage[] = PIPELINE_STAGES.map((s) => s.name);

export const DEFAULT_VISIBLE_STAGES: DealStage[] = [
  "New",
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Customer",
];

export function stageIdFromName(name: DealStage): string {
  return name.toLowerCase().replace(/ /g, "-");
}

export const STAGE_COLORS: Record<string, string> = {
  New: "bg-gray-100 text-gray-700",
  Lead: "bg-blue-100 text-blue-700",
  Qualified: "bg-orange-100 text-orange-700",
  Proposal: "bg-purple-100 text-purple-700",
  Negotiation: "bg-amber-100 text-amber-700",
  Customer: "bg-green-100 text-green-700",
  Churned: "bg-red-100 text-red-700",
  "Closed Lost": "bg-red-100 text-red-700",
};
