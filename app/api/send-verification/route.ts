import { NextResponse } from "next/server";
import { Resend } from "resend";
import VerificationEmail from "@/emails/verification-email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("RESEND_API_KEY not configured - skipping email send");
      return NextResponse.json({ success: true, skipped: true });
    }

    const resend = new Resend(apiKey);
    const { email, token, userName } = await request.json();

    if (!email || !token) {
      return NextResponse.json(
        { error: "Email and token are required" },
        { status: 400 }
      );
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const verificationUrl = `${baseUrl}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

    const { data, error } = await resend.emails.send({
      from: "ACME Signal <noreply@qatech.email>",
      to: email,
      subject: "Verify your email - ACME Signal",
      react: VerificationEmail({ verificationUrl, userName }),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return NextResponse.json(
      { error: "Failed to send verification email" },
      { status: 500 }
    );
  }
}
