import { Metadata } from "next";
import { CollectionsClient } from "./collections-client";

export const metadata: Metadata = {
  title: "Lists",
};

export default function CollectionsPage() {
  return <CollectionsClient />;
}
