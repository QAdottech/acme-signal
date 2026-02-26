export interface FundingRound {
  id: string;
  date: string;
  amount: string;
  roundType: string;
  investors: string[];
}

export interface Founder {
  name: string;
  role?: string;
  linkedin?: string;
}

export interface Organization {
  id: string;
  name: string;
  industry: string;
  location: string;
  employees: number;
  logo: string;
  website_url: string;
  description: string;
  assessmentStatus:
    | "Not assessed"
    | "Screening"
    | "Passive follow"
    | "Hitlist"
    | "Preparing for NDC"
    | "Portfolio company"
    | "Lost"
    | "Not interesting";
  collections: string[];
  fundingRounds?: FundingRound[];
  exitStatus?: "IPO" | "Acquired";
  exitDate?: string;
  acquiredBy?: string;
  founders?: Founder[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  organizationIds: string[];
  tags: string[];
}
