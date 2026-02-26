import type { DealStage } from "./organization";

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
}
