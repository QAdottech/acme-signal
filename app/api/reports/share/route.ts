import { NextResponse } from "next/server";
import { Resend } from "resend";
import ReportEmail from "@/emails/report-email";

export const dynamic = "force-dynamic";

interface ReportEmailData {
  title: string;
  description: string;
  metrics: { label: string; value: string }[];
  tableData?: { headers: string[]; rows: string[][] };
  generatedAt: string;
}

interface ShareReportRequest {
  recipientEmail: string;
  senderName: string;
  reportData: ReportEmailData;
  personalMessage?: string;
}

export async function POST(request: Request) {
  try {
    const body: ShareReportRequest = await request.json();
    const { recipientEmail, senderName, reportData, personalMessage } = body;

    // Validate required fields
    if (!recipientEmail || !recipientEmail.trim()) {
      return NextResponse.json(
        { error: "Recipient email is required" },
        { status: 400 }
      );
    }

    if (!senderName || !senderName.trim()) {
      return NextResponse.json(
        { error: "Sender name is required" },
        { status: 400 }
      );
    }

    if (!reportData || !reportData.title) {
      return NextResponse.json(
        { error: "Report data with a title is required" },
        { status: 400 }
      );
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail.trim())) {
      return NextResponse.json(
        { error: "Invalid email address format" },
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
      from: "ACME Signal <onboarding@resend.dev>",
      to: recipientEmail.trim(),
      subject: `${senderName} shared a report: ${reportData.title}`,
      react: ReportEmail({
        senderName,
        personalMessage: personalMessage?.trim() || undefined,
        reportTitle: reportData.title,
        reportDescription: reportData.description,
        metrics: reportData.metrics || [],
        tableData: reportData.tableData,
        generatedAt: reportData.generatedAt,
      }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Failed to send report email:", error);
    return NextResponse.json(
      { error: "Failed to send report email" },
      { status: 500 }
    );
  }
}
