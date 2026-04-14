import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUserSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { auditLog } from "@/lib/server/audit";
import { getClientIp } from "@/lib/server/request-context";

const schema = z.object({
  message: z.string().min(2).max(500),
});

const phishingTips = [
  "Check domain spelling and top-level domain carefully.",
  "Avoid links creating urgency around password resets.",
  "Do not enter credentials on pages with invalid SSL info.",
  "Hover links to inspect destination before clicking.",
  "Use MFA and password managers to reduce phishing risk.",
];

export async function POST(request: Request) {
  const auth = await requireUserSession();
  if (!auth.ok) {
    return auth.response;
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`chat:${auth.userId}:${ip}`, 40, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    await auditLog({
      userId: auth.userId,
      route: "/api/chat",
      method: "POST",
      statusCode: 400,
      message: "Invalid chat payload",
    });
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  const message = parsed.data.message.toLowerCase();
  const mentionsSafety = /safe|phish|malicious|suspicious|link|url/.test(message);

  const reply = mentionsSafety
    ? "This link should be treated as untrusted until scanned. Verify the real domain owner, check SSL validity, and look for social engineering cues such as urgency or credential prompts."
    : "I can help evaluate URL safety, explain phishing patterns, and recommend remediation steps. Ask me about a link or phishing tactic.";

  await auditLog({
    userId: auth.userId,
    route: "/api/chat",
    method: "POST",
    statusCode: 200,
    message: "Chat response generated",
  });

  return NextResponse.json({
    reply,
    recommendations: phishingTips,
  });
}
