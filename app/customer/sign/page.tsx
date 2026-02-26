import { Metadata } from "next";
import { Dancing_Script } from "next/font/google";
import { SignPageClient } from "./sign-client";
import { buildProposalConfig, type ProposalConfig } from "./types";

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-signature",
});

export const metadata: Metadata = {
  title: "Sign your deal",
  description: "Review and sign your deal",
};

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default function CustomerSignPage({ searchParams }: PageProps) {
  const params = searchParams ?? {};
  const config = buildProposalConfig(params);
  const withEnv: ProposalConfig = {
    ...config,
    vendorName:
      config.vendorName ||
      (process.env.NEXT_PUBLIC_VENDOR_NAME as string) ||
      "",
    vendorAddress:
      config.vendorAddress ||
      (process.env.NEXT_PUBLIC_VENDOR_ADDRESS as string) ||
      "",
    vendorWebsite:
      config.vendorWebsite ||
      (process.env.NEXT_PUBLIC_VENDOR_WEBSITE as string) ||
      "",
    vendorLogo:
      config.vendorLogo ||
      (process.env.NEXT_PUBLIC_VENDOR_LOGO as string) ||
      "",
    supportEmail:
      config.supportEmail ||
      (process.env.NEXT_PUBLIC_SUPPORT_EMAIL as string) ||
      "",
  };
  return (
    <div className={dancingScript.variable}>
      <SignPageClient
        signatureFontClassName={dancingScript.className}
        proposal={withEnv}
      />
    </div>
  );
}
