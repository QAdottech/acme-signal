import { Metadata } from "next";
import { CollectionDetailClient } from "./collection-detail-client";

export const metadata: Metadata = {
  title: "List",
};

export default function CollectionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return <CollectionDetailClient params={params} />;
}
