import { Metadata } from "next";
import { SignupClient } from "./signup-client";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default function SignupPage() {
  return <SignupClient />;
}
