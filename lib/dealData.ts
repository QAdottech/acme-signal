import type { Deal } from "@/types/deal";
import type { DealStage } from "@/types/organization";
import { getSupabase, newId, throwIfError } from "@/lib/supabase";

interface DealRow {
  id: string;
  title: string;
  organization_id: string | null;
  value: number | string;
  currency: string;
  stage: Deal["stage"];
  expected_close_date: string | null;
  owner: string;
  probability: number;
  next_step: string | null;
  tags: string[] | null;
  contact_ids: string[] | null;
  last_activity_date: string | null;
  last_activity_type: Deal["lastActivityType"] | null;
  signature_status: Deal["signatureStatus"] | null;
  signature_sent_at: string | null;
  signature_recipient_email: string | null;
  created_at: string;
}

function mapDeal(row: DealRow): Deal {
  return {
    id: row.id,
    title: row.title,
    organizationId: row.organization_id ?? "",
    value: Number(row.value),
    currency: row.currency,
    stage: row.stage,
    expectedCloseDate: row.expected_close_date ?? "",
    owner: row.owner,
    probability: row.probability,
    createdAt: row.created_at,
    nextStep: row.next_step ?? undefined,
    tags: row.tags ?? undefined,
    contactIds: row.contact_ids ?? undefined,
    lastActivityDate: row.last_activity_date ?? undefined,
    lastActivityType: row.last_activity_type ?? undefined,
    signatureStatus: row.signature_status ?? undefined,
    signatureSentAt: row.signature_sent_at ?? undefined,
    signatureRecipientEmail: row.signature_recipient_email ?? undefined,
  };
}

function toRow(deal: Deal): DealRow {
  return {
    id: deal.id,
    title: deal.title,
    organization_id: deal.organizationId || null,
    value: deal.value,
    currency: deal.currency,
    stage: deal.stage,
    expected_close_date: deal.expectedCloseDate || null,
    owner: deal.owner,
    probability: deal.probability,
    next_step: deal.nextStep ?? null,
    tags: deal.tags ?? [],
    contact_ids: deal.contactIds ?? [],
    last_activity_date: deal.lastActivityDate ?? null,
    last_activity_type: deal.lastActivityType ?? null,
    signature_status: deal.signatureStatus ?? null,
    signature_sent_at: deal.signatureSentAt ?? null,
    signature_recipient_email: deal.signatureRecipientEmail ?? null,
    created_at: deal.createdAt,
  };
}

export async function getDeals(): Promise<Deal[]> {
  const { data, error } = await getSupabase().from("deals").select("*");
  throwIfError(error, "getDeals");
  return ((data ?? []) as DealRow[]).map(mapDeal);
}

export async function getDeal(id: string): Promise<Deal | undefined> {
  const { data, error } = await getSupabase()
    .from("deals")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error, "getDeal");
  return data ? mapDeal(data as DealRow) : undefined;
}

export async function getDealsForOrganization(
  organizationId: string
): Promise<Deal[]> {
  const { data, error } = await getSupabase()
    .from("deals")
    .select("*")
    .eq("organization_id", organizationId);
  throwIfError(error, "getDealsForOrganization");
  return ((data ?? []) as DealRow[]).map(mapDeal);
}

export async function saveDeal(deal: Deal): Promise<Deal> {
  const { error } = await getSupabase().from("deals").upsert(toRow(deal));
  throwIfError(error, "saveDeal");
  return deal;
}

export async function addDeal(
  deal: Omit<Deal, "id" | "createdAt">
): Promise<Deal> {
  const newDeal: Deal = {
    ...deal,
    id: "d" + newId(),
    createdAt: new Date().toISOString(),
  };
  await saveDeal(newDeal);
  return newDeal;
}

export async function deleteDeal(dealId: string): Promise<void> {
  const { error } = await getSupabase().from("deals").delete().eq("id", dealId);
  throwIfError(error, "deleteDeal");
}

export async function saveDeals(deals: Deal[]): Promise<void> {
  const existing = await getDeals();
  const nextIds = new Set(deals.map((deal) => deal.id));
  const toDelete = existing
    .filter((deal) => !nextIds.has(deal.id))
    .map((deal) => deal.id);
  if (toDelete.length > 0) {
    const { error } = await getSupabase().from("deals").delete().in("id", toDelete);
    throwIfError(error, "saveDeals.delete");
  }
  if (deals.length === 0) return;
  const { error } = await getSupabase().from("deals").upsert(deals.map(toRow));
  throwIfError(error, "saveDeals");
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

export async function getTotalPipelineValue(): Promise<number> {
  const pipelineStages: DealStage[] = [
    "New",
    "Lead",
    "Qualified",
    "Proposal",
    "Negotiation",
  ];
  const deals = await getDeals();
  return deals
    .filter((deal) => pipelineStages.includes(deal.stage))
    .reduce((sum, deal) => sum + deal.value, 0);
}

export async function getWeightedPipelineValue(): Promise<number> {
  const pipelineStages: DealStage[] = [
    "New",
    "Lead",
    "Qualified",
    "Proposal",
    "Negotiation",
  ];
  const deals = await getDeals();
  return deals
    .filter((deal) => pipelineStages.includes(deal.stage))
    .reduce((sum, deal) => sum + deal.value * (deal.probability / 100), 0);
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
