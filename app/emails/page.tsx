import { Metadata } from "next";
import { EmailsClient } from "./emails-client";

export const metadata: Metadata = {
  title: "Emails",
};

export default function EmailsPage() {
  return <EmailsClient />;
}
