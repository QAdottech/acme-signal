import { NextResponse } from "next/server";
import { Resend } from "resend";
import SignatureRequestEmail from "@/emails/signature-request-email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const {
      recipientEmail,
      customerName,
      dealName,
      amount,
      senderName,
      signUrl,
      personalMessage,
    } = await request.json();

    if (!recipientEmail || !signUrl) {
      return NextResponse.json(
        { error: "Recipient email and sign URL are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured - skipping email send");
      return NextResponse.json({ success: true, skipped: true });
    }

    const resend = new Resend(apiKey);

    const { data, error } = await resend.emails.send({
      from: "ACME Signal <noreply@qatech.email>",
      to: recipientEmail,
      subject: `Proposal ready for signature: ${dealName || "Your proposal"}`,
      react: SignatureRequestEmail({
        customerName: customerName || "there",
        dealName: dealName || "your proposal",
        amount: amount || "",
        senderName: senderName || "Your account team",
        signUrl,
        personalMessage,
      }),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Failed to send signature email:", error);
    return NextResponse.json(
      { error: "Failed to send signature email" },
      { status: 500 }
    );
  }
}
