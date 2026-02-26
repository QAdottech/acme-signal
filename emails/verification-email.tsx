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

interface VerificationEmailProps {
  verificationUrl: string;
  userName?: string;
}

export default function VerificationEmail({
  verificationUrl,
  userName,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for ACME Signal</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <div style={logoBox}>
              <span style={logoText}>A</span>
            </div>
          </Section>
          <Heading style={heading}>Welcome to ACME Signal</Heading>
          <Text style={paragraph}>
            Hi{userName ? ` ${userName}` : ""},
          </Text>
          <Text style={paragraph}>
            Thanks for signing up! Please verify your email address by clicking
            the button below.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={verificationUrl}>
              Verify your email
            </Button>
          </Section>
          <Text style={paragraph}>
            If you didn&apos;t create an account with ACME Signal, you can
            safely ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>ACME Signal - Your CRM, simplified.</Text>
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
  maxWidth: "480px",
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

const buttonSection = {
  textAlign: "center" as const,
  margin: "32px 0",
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

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0 16px",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
};
