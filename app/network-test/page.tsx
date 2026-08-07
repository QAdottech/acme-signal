import { Metadata } from "next";
import { NetworkTestClient } from "./network-test-client";

export const metadata: Metadata = {
  title: "Network header test",
  description:
    "Sandbox page that sends a fetch with custom outgoing request headers for verifyNetworkRequest validation",
};

export default function NetworkTestPage() {
  return <NetworkTestClient />;
}
