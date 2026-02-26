export type DealStage =
  | "New"
  | "Lead"
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Customer"
  | "Churned"
  | "Closed Lost";

export interface Organization {
  id: string;
  name: string;
  industry: string;
  location: string;
  employees: number;
  logo: string;
  website_url: string;
  description: string;
  dealStage: DealStage;
  collections: string[];
  annualRevenue?: string;
  owner?: string;
  lastContacted?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  organizationIds: string[];
  tags: string[];
}
