import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface SignatureRequestEmailProps {
  customerName: string;
  dealName: string;
  amount: string;
  senderName: string;
  signUrl: string;
  personalMessage?: string;
}

export default function SignatureRequestEmail({
  customerName,
  dealName,
  amount,
  senderName,
  signUrl,
  personalMessage,
}: SignatureRequestEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>
        {senderName} sent you a proposal to sign: {dealName}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <div style={logoBox}>
              <span style={logoText}>A</span>
            </div>
          </Section>

          <Heading style={heading}>Proposal ready for signature</Heading>

          <Text style={paragraph}>Hi {customerName},</Text>

          <Text style={paragraph}>
            {senderName} has sent you a proposal for <strong>{dealName}</strong>{" "}
            ({amount}) that is ready for your review and signature.
          </Text>

          {personalMessage && (
            <Section style={messageSection}>
              <Text style={messageText}>&ldquo;{personalMessage}&rdquo;</Text>
              <Text style={messageSender}>— {senderName}</Text>
            </Section>
          )}

          <Section style={buttonSection}>
            <Button style={button} href={signUrl}>
              Review & Sign Proposal
            </Button>
          </Section>

          <Text style={smallText}>
            If the button above doesn&apos;t work, copy and paste this link into
            your browser:
          </Text>
          <Text style={linkText}>{signUrl}</Text>

          <Hr style={hr} />

          <Text style={footer}>
            Sent via ACME Signal on behalf of {senderName}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f9fafb",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 24px",
  maxWidth: "600px",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logoBox = {
  display: "inline-block",
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: "#2D1A45",
  textAlign: "center" as const,
  lineHeight: "48px",
};

const logoText = {
  color: "#ffffff",
  fontSize: "20px",
  fontWeight: "bold" as const,
};

const heading = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  textAlign: "center" as const,
  color: "#111827",
  margin: "0 0 24px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#4b5563",
  margin: "0 0 16px",
};

const messageSection = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px 20px",
  margin: "0 0 24px",
};

const messageText = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#92400e",
  fontStyle: "italic" as const,
  margin: "0 0 8px",
};

const messageSender = {
  fontSize: "13px",
  color: "#92400e",
  margin: "0",
};

const buttonSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#f97316",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "600" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  padding: "12px 32px",
};

const smallText = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "0 0 4px",
};

const linkText = {
  fontSize: "12px",
  color: "#f97316",
  wordBreak: "break-all" as const,
  margin: "0 0 16px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0 16px",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
};
