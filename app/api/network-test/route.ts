import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = request.headers.get("x-request-id");
  const customHeader = request.headers.get("x-qa-tech-test-header");

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  if (!requestId?.trim()) {
    return NextResponse.json(
      {
        success: false,
        error: "Missing X-Request-Id request header",
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    received: {
      requestId,
      customHeader,
      body,
    },
  });
}
