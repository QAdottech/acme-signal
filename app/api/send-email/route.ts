import { NextResponse } from "next/server";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured - skipping email send");
      return NextResponse.json({ success: true, skipped: true });
    }
    const resend = new Resend(apiKey);
    const { to, subject, body } = await request.json();

    if (!to || !subject) {
      return NextResponse.json(
        { error: "To and subject are required" },
        { status: 400 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "ACME Signal <onboarding@resend.dev>",
      to,
      subject,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; width: 40px; height: 40px; border-radius: 10px; background: #2D1A45; text-align: center; line-height: 40px;">
            <span style="color: white; font-weight: bold; font-size: 16px;">A</span>
          </div>
        </div>
        <div style="white-space: pre-wrap; font-size: 14px; color: #374151; line-height: 1.6;">${body || ""}</div>
        <hr style="border-color: #e5e7eb; margin: 32px 0 16px;" />
        <p style="font-size: 12px; color: #9ca3af; text-align: center;">Sent via ACME Signal</p>
      </div>`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
