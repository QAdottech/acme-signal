export interface Person {
  id: string;
  name: string;
  email: string;
  role: string;
  organization: string;
  phone?: string;
  linkedIn?: string;
  notes?: string;
  avatar?: string;
  status: "Active" | "Inactive";
  lastContact?: string;
}
