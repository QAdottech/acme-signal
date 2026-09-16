import type { Deal } from "@/types/deal";
import type { Collection, DealStage, Organization } from "@/types/organization";

export const QUARTERLY_QUOTA = 600_000;
export const STALL_DAYS = 21;

export const PIPELINE_COLUMNS: {
  id: string;
  title: string;
  stage: DealStage;
}[] = [
  { id: "new", title: "New", stage: "New" },
  { id: "lead", title: "Lead", stage: "Lead" },
  { id: "qualified", title: "Qualified", stage: "Qualified" },
  { id: "proposal", title: "Proposal", stage: "Proposal" },
  { id: "negotiation", title: "Closing", stage: "Negotiation" },
];

export const OPEN_STAGES: DealStage[] = [
  "New",
  "Lead",
  "Qualified",
  "Proposal",
  "Negotiation",
];

export type PipelineViewId = "closing-quarter" | "stalled" | "ai";

export const PIPELINE_VIEWS: {
  id: PipelineViewId;
  name: string;
  href: string;
  color: string;
  shape: "circle" | "square";
}[] = [
  {
    id: "closing-quarter",
    name: "Closing this quarter",
    href: "/?view=closing-quarter",
    color: "bg-orange-400",
    shape: "circle",
  },
  {
    id: "stalled",
    name: "Stalled > 21 days",
    href: "/?view=stalled",
    color: "bg-red-400",
    shape: "square",
  },
  {
    id: "ai",
    name: "AI Infrastructure",
    href: "/?view=ai",
    color: "bg-emerald-500",
    shape: "square",
  },
];

const AVATAR_COLORS = [
  "bg-slate-800 text-white",
  "bg-zinc-800 text-white",
  "bg-emerald-800 text-white",
  "bg-indigo-800 text-white",
  "bg-stone-300 text-stone-800",
  "bg-teal-700 text-white",
  "bg-amber-800 text-white",
  "bg-green-700 text-white",
  "bg-orange-600 text-white",
  "bg-rose-700 text-white",
  "bg-blue-800 text-white",
  "bg-violet-800 text-white",
  "bg-cyan-800 text-white",
  "bg-neutral-700 text-white",
];

export const TAG_COLORS: Record<string, string> = {
  "Pre POC": "bg-neutral-100 text-neutral-600",
  POC: "bg-neutral-100 text-neutral-600",
  "POC Complete": "bg-emerald-50 text-emerald-700",
  Enterprise: "bg-violet-100 text-violet-700",
  Startup: "bg-purple-100 text-purple-600",
  Expansion: "bg-violet-100 text-violet-700",
  Renewal: "bg-teal-100 text-teal-700",
  "At Risk": "bg-red-100 text-red-700",
  "Champion Identified": "bg-pink-100 text-pink-700",
  Champion: "bg-pink-100 text-pink-700",
  "Technical Eval": "bg-neutral-100 text-neutral-600",
  "Tech eval": "bg-neutral-100 text-neutral-600",
  Hot: "bg-orange-100 text-orange-700",
  Slipping: "bg-orange-100 text-orange-600",
};

export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

export function getAvatarColor(seed: string): string {
  return AVATAR_COLORS[hashString(seed) % AVATAR_COLORS.length];
}

export function isOpenDeal(deal: Deal): boolean {
  return OPEN_STAGES.includes(deal.stage);
}

export function getDaysSinceActivity(deal: Deal): number {
  const date = deal.lastActivityDate || deal.createdAt;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function isDealStalled(deal: Deal, days = STALL_DAYS): boolean {
  return isOpenDeal(deal) && getDaysSinceActivity(deal) >= days;
}

export function currentQuarterRange(now = new Date()): { start: string; end: string } {
  const quarter = Math.floor(now.getMonth() / 3);
  const start = new Date(now.getFullYear(), quarter * 3, 1);
  const end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
  const iso = (d: Date) => d.toISOString().split("T")[0];
  return { start: iso(start), end: iso(end) };
}

export function applyPipelineView(
  deals: Deal[],
  view: string | null,
  organizations: Record<string, Organization>,
  collections: Collection[]
): Deal[] {
  if (!view) return deals;

  if (view === "closing-quarter") {
    const { start, end } = currentQuarterRange();
    return deals.filter((deal) => {
      const close = deal.expectedCloseDate?.slice(0, 10);
      return close >= start && close <= end;
    });
  }

  if (view === "stalled") {
    return deals.filter((deal) => isDealStalled(deal));
  }

  if (view === "ai") {
    const aiCollection = collections.find((c) =>
      c.name.toLowerCase().includes("artificial intelligence")
    );
    const ids = new Set(aiCollection?.organizationIds ?? []);
    return deals.filter((deal) => {
      const org = organizations[deal.organizationId];
      const industry = org?.industry?.toLowerCase() ?? "";
      return (
        ids.has(deal.organizationId) ||
        industry.includes("artificial") ||
        industry.includes("ai")
      );
    });
  }

  return deals;
}

export function displayStageName(stage: DealStage | string): string {
  if (stage === "Negotiation") return "Closing";
  return stage;
}

export function columnIdForStage(stage: DealStage | string): string {
  return stage.toLowerCase().replace(/ /g, "-");
}

export function buildWeightedSparkline(currentWeighted: number, weeks = 13) {
  const start = currentWeighted / 1.061 || 0;
  const values = Array.from({ length: weeks }, (_, i) => {
    const t = i / Math.max(weeks - 1, 1);
    const wave = Math.sin(i * 0.9) * currentWeighted * 0.02;
    return start + (currentWeighted - start) * (0.35 * t * t + 0.65 * t) + wave;
  });
  if (values.length > 0) {
    values[values.length - 1] = currentWeighted;
  }
  const changePct =
    start > 0 ? ((currentWeighted - start) / start) * 100 : 0;
  return { values, changePct };
}

export function dealTag(deal: Deal): string | null {
  if (isDealStalled(deal)) return "Slipping";
  if ((deal.probability ?? 0) >= 40 && getDaysSinceActivity(deal) <= 2) {
    const existing = deal.tags?.[0];
    if (existing === "Champion Identified") return "Champion";
    return existing || "Hot";
  }
  const tag = deal.tags?.[0];
  if (tag === "Champion Identified") return "Champion";
  if (tag === "Technical Eval") return "Tech eval";
  return tag ?? null;
}
