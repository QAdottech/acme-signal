import { NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { name, message, turnstileToken } = await request.json();

    if (!name?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name and message are required" },
        { status: 400 }
      );
    }

    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Complete the Turnstile challenge" },
        { status: 400 }
      );
    }

    const forwarded = request.headers.get("x-forwarded-for");
    const remoteIp = forwarded?.split(",")[0]?.trim();

    const verification = await verifyTurnstileToken(turnstileToken, remoteIp);
    if (!verification.success) {
      return NextResponse.json(
        {
          error: "Turnstile verification failed",
          codes: verification.errorCodes,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      received: { name: name.trim(), message: message.trim() },
    });
  } catch (error) {
    console.error("Turnstile test submit failed:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}
