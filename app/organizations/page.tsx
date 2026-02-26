import { Metadata } from "next";
import { OrganizationsClient } from "./organizations-client";

export const metadata: Metadata = {
  title: "Organizations",
};

export default function OrganizationsPage() {
  return <OrganizationsClient />;
}
