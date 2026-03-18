import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const QATECH_BOT_PATTERN = /QATechBot/i;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET(request: Request) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const isQATechBot = QATECH_BOT_PATTERN.test(userAgent);

  const detailLines: [string, string][] = [
    ["Method", request.method],
    ["URL", request.url],
  ];

  const pairs: [string, string][] = [];
  request.headers.forEach((value, key) => pairs.push([key, value]));
  pairs.sort((a, b) => {
    const ua = (k: string) => k.toLowerCase() === "user-agent";
    if (ua(a[0]) && !ua(b[0])) return -1;
    if (!ua(a[0]) && ua(b[0])) return 1;
    return a[0].toLowerCase().localeCompare(b[0].toLowerCase());
  });
  detailLines.push(...pairs);

  const detailsHtml = detailLines
    .map(
      ([k, v]) =>
        `<dt>${escapeHtml(k)}</dt><dd><pre>${escapeHtml(v)}</pre></dd>`
    )
    .join("");

  const verdict = isQATechBot ? "YES" : "NO";
  const verdictClass = isQATechBot ? "yes" : "no";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>User-Agent — QATechBot?</title>
  <style>
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      margin: 0;
      padding: 2rem;
      background: #0f0f12;
      color: #e8e8ed;
      line-height: 1.5;
    }
    h1 { font-size: 1rem; font-weight: 600; color: #888; margin: 0 0 0.5rem; }
    .verdict {
      font-size: clamp(3rem, 12vw, 6rem);
      font-weight: 800;
      letter-spacing: -0.03em;
      line-height: 1.1;
      margin-bottom: 0.25rem;
    }
    .verdict.yes { color: #34d399; }
    .verdict.no { color: #f87171; }
    .sub { font-size: 1.125rem; color: #a1a1aa; margin-bottom: 2.5rem; }
    h2 {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #71717a;
      margin: 0 0 1rem;
      border-bottom: 1px solid #27272a;
      padding-bottom: 0.5rem;
    }
    dl { margin: 0; }
    dt {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #71717a;
      margin-top: 1rem;
    }
    dt:first-child { margin-top: 0; }
    dd { margin: 0.35rem 0 0; }
    dd pre {
      margin: 0;
      font-size: 0.9rem;
      white-space: pre-wrap;
      word-break: break-word;
      color: #d4d4d8;
      background: #18181b;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      border: 1px solid #27272a;
    }
  </style>
</head>
<body>
  <h1>Is it QATechBot?</h1>
  <div class="verdict ${verdictClass}">${verdict}</div>
  <p class="sub">Based on the <code>User-Agent</code> header (case-insensitive match for <code>QATechBot</code>).</p>
  <h2>Request details</h2>
  <dl>${detailsHtml}</dl>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
