import type { DealStage } from "./organization";

export type ActivityType = "email" | "meeting" | "note" | "call" | "task";

export interface Deal {
  id: string;
  title: string;
  organizationId: string;
  value: number;
  currency: string;
  stage: DealStage;
  expectedCloseDate: string;
  owner: string;
  probability: number;
  createdAt: string;
  nextStep?: string;
  tags?: string[];
  contactIds?: string[];
  lastActivityDate?: string;
  lastActivityType?: ActivityType;
}
