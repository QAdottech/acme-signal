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

interface ReportEmailMetric {
  label: string;
  value: string;
}

interface ReportEmailProps {
  senderName: string;
  personalMessage?: string;
  reportTitle: string;
  reportDescription: string;
  metrics: ReportEmailMetric[];
  tableData?: { headers: string[]; rows: string[][] };
  generatedAt: string;
}

export default function ReportEmail({
  senderName,
  personalMessage,
  reportTitle,
  reportDescription,
  metrics,
  tableData,
  generatedAt,
}: ReportEmailProps) {
  const formattedDate = new Date(generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Html>
      <Head />
      <Preview>
        {senderName} shared a report: {reportTitle}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo */}
          <Section style={logoSection}>
            <div style={logoBox}>
              <span style={logoText}>A</span>
            </div>
          </Section>

          {/* Header */}
          <Heading style={heading}>Report shared by {senderName}</Heading>

          {/* Personal message */}
          {personalMessage && (
            <Section style={messageSection}>
              <Text style={messageText}>&ldquo;{personalMessage}&rdquo;</Text>
            </Section>
          )}

          <Hr style={hr} />

          {/* Report title and description */}
          <Heading style={reportTitleStyle}>{reportTitle}</Heading>
          <Text style={paragraph}>{reportDescription}</Text>

          {/* Metrics grid */}
          {metrics.length > 0 && (
            <Section style={metricsSection}>
              <table
                style={metricsTable}
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
              >
                <tbody>
                  <tr>
                    {metrics.map((metric, index) => (
                      <td key={index} style={metricCell}>
                        <div style={metricValue}>{metric.value}</div>
                        <div style={metricLabel}>{metric.label}</div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </Section>
          )}

          {/* Data table */}
          {tableData && tableData.headers.length > 0 && (
            <Section style={tableSectionStyle}>
              <table
                style={dataTable}
                cellPadding="0"
                cellSpacing="0"
                role="presentation"
              >
                <thead>
                  <tr>
                    {tableData.headers.map((header, index) => (
                      <th key={index} style={tableHeader}>
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          style={{
                            ...tableCell,
                            backgroundColor:
                              rowIndex % 2 === 0 ? "#ffffff" : "#f9fafb",
                          }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>
          )}

          {/* Generated date */}
          <Text style={generatedText}>Generated on {formattedDate}</Text>

          {/* CTA button */}
          <Section style={buttonSection}>
            <Button style={button} href="https://acme-signal.app">
              View in ACME Signal
            </Button>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
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
  margin: "0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "24px",
  color: "#4b5563",
  margin: "0 0 16px",
};

const reportTitleStyle = {
  fontSize: "20px",
  fontWeight: "bold" as const,
  color: "#111827",
  margin: "24px 0 8px",
};

const metricsSection = {
  margin: "24px 0",
};

const metricsTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
};

const metricCell = {
  textAlign: "center" as const,
  padding: "16px 8px",
  backgroundColor: "#ffffff",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
};

const metricValue = {
  fontSize: "24px",
  fontWeight: "bold" as const,
  color: "#f97316",
  marginBottom: "4px",
};

const metricLabel = {
  fontSize: "12px",
  color: "#6b7280",
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
};

const tableSectionStyle = {
  margin: "24px 0",
};

const dataTable = {
  width: "100%",
  borderCollapse: "collapse" as const,
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  overflow: "hidden" as const,
};

const tableHeader = {
  backgroundColor: "#2D1A45",
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "600" as const,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  padding: "10px 12px",
  textAlign: "left" as const,
  borderBottom: "2px solid #1a0f2e",
};

const tableCell = {
  fontSize: "13px",
  color: "#374151",
  padding: "10px 12px",
  borderBottom: "1px solid #e5e7eb",
};

const generatedText = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
  margin: "24px 0 8px",
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

const hr = {
  borderColor: "#e5e7eb",
  margin: "32px 0 16px",
};

const footer = {
  fontSize: "12px",
  color: "#9ca3af",
  textAlign: "center" as const,
};
