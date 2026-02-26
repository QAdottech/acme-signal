import { Metadata } from "next";
import { DealDetailClient } from "./deal-detail-client";

export const metadata: Metadata = {
  title: "Deal",
};

export default function DealPage({
  params,
}: {
  params: { id: string };
}) {
  return <DealDetailClient params={params} />;
}
