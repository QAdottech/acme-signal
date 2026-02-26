import { Metadata } from "next";
import { OrganizationDetailClient } from "./organization-detail-client";

export const metadata: Metadata = {
  title: "Organization",
};

export default function OrganizationPage({
  params,
}: {
  params: { id: string };
}) {
  return <OrganizationDetailClient params={params} />;
}
