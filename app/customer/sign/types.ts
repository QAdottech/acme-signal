export type ProposalConfig = {
  customerName: string;
  dealName: string;
  amount: string;
  currency: string;
  termLength: string;
  renewalBehavior: string;
  cancellationWindow: string;
  seats: string;
  slaTier: string;
  paymentTerms: string;
  billingFrequency: string;
  invoiceStartDate: string;
  taxHandling: string;
  vendorName: string;
  vendorAddress: string;
  vendorWebsite: string;
  vendorLogo: string;
  customerCompany: string;
  billingContact: string;
  repName: string;
  repEmail: string;
  effectiveDate: string;
  lastUpdated: string;
  proposalId: string;
  recipientEmail: string;
  countersignDays: string;
  supportEmail: string;
};

const defaultConfig: ProposalConfig = {
  customerName: "",
  dealName: "",
  amount: "",
  currency: "USD",
  termLength: "",
  renewalBehavior: "",
  cancellationWindow: "",
  seats: "",
  slaTier: "",
  paymentTerms: "",
  billingFrequency: "",
  invoiceStartDate: "",
  taxHandling: "",
  vendorName: "",
  vendorAddress: "",
  vendorWebsite: "",
  vendorLogo: "",
  customerCompany: "",
  billingContact: "",
  repName: "",
  repEmail: "",
  effectiveDate: "",
  lastUpdated: "",
  proposalId: "",
  recipientEmail: "",
  countersignDays: "3",
  supportEmail: "",
};

function getStr(
  params: { [key: string]: string | string[] | undefined },
  key: string
): string {
  const v = params[key];
  if (v == null) return "";
  return Array.isArray(v) ? (v[0] ?? "") : (v ?? "");
}

export function buildProposalConfig(
  params: { [key: string]: string | string[] | undefined }
): ProposalConfig {
  const p = params ?? {};
  const today = new Date().toISOString().slice(0, 10);
  return {
    customerName: getStr(p, "customer_name") || defaultConfig.customerName,
    dealName: getStr(p, "deal_name") || defaultConfig.dealName,
    amount: getStr(p, "amount") || defaultConfig.amount,
    currency: getStr(p, "currency") || defaultConfig.currency,
    termLength: getStr(p, "term_length") || defaultConfig.termLength,
    renewalBehavior:
      getStr(p, "renewal_behavior") || defaultConfig.renewalBehavior,
    cancellationWindow:
      getStr(p, "cancellation_window") || defaultConfig.cancellationWindow,
    seats: getStr(p, "seats") || defaultConfig.seats,
    slaTier: getStr(p, "sla_tier") || defaultConfig.slaTier,
    paymentTerms: getStr(p, "payment_terms") || defaultConfig.paymentTerms,
    billingFrequency:
      getStr(p, "billing_frequency") || defaultConfig.billingFrequency,
    invoiceStartDate:
      getStr(p, "invoice_start_date") || defaultConfig.invoiceStartDate,
    taxHandling: getStr(p, "tax_handling") || defaultConfig.taxHandling,
    vendorName: getStr(p, "vendor_name") || defaultConfig.vendorName,
    vendorAddress: getStr(p, "vendor_address") || defaultConfig.vendorAddress,
    vendorWebsite: getStr(p, "vendor_website") || defaultConfig.vendorWebsite,
    vendorLogo: getStr(p, "vendor_logo") || defaultConfig.vendorLogo,
    customerCompany:
      getStr(p, "customer_company") || defaultConfig.customerCompany,
    billingContact:
      getStr(p, "billing_contact") || defaultConfig.billingContact,
    repName: getStr(p, "rep_name") || defaultConfig.repName,
    repEmail: getStr(p, "rep_email") || defaultConfig.repEmail,
    effectiveDate: getStr(p, "effective_date") || today,
    lastUpdated: getStr(p, "last_updated") || defaultConfig.lastUpdated,
    proposalId: getStr(p, "proposal_id") || defaultConfig.proposalId,
    recipientEmail:
      getStr(p, "recipient_email") || defaultConfig.recipientEmail,
    countersignDays:
      getStr(p, "countersign_days") || defaultConfig.countersignDays,
    supportEmail: getStr(p, "support_email") || defaultConfig.supportEmail,
  };
}

export const emptyProposalConfig: ProposalConfig = defaultConfig;
