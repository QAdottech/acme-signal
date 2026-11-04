import { Metadata } from "next";
import { PersonDetailClient } from "./person-detail-client";

export const metadata: Metadata = {
  title: "Person",
};

export default function PersonPage({ params }: { params: { id: string } }) {
  return <PersonDetailClient params={params} />;
}
