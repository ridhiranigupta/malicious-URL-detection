import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchWhois } from "@/lib/services/threat-intel";
import { normalizeUrl } from "@/lib/utils";
import { requireUserSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { auditLog } from "@/lib/server/audit";
import { getClientIp } from "@/lib/server/request-context";

const schema = z.object({
  url: z.string().min(4),
});

export async function POST(request: Request) {
  const auth = await requireUserSession();
  if (!auth.ok) {
    return auth.response;
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`whois:${auth.userId}:${ip}`, 25, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    await auditLog({ userId: auth.userId, route: "/api/whois", method: "POST", statusCode: 400, message: "Invalid payload" });
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(parsed.data.url);
  } catch {
    await auditLog({ userId: auth.userId, route: "/api/whois", method: "POST", statusCode: 400, message: "Invalid URL" });
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const data = await fetchWhois(normalizedUrl);
  await auditLog({ userId: auth.userId, route: "/api/whois", method: "POST", statusCode: 200, message: "Whois lookup completed" });
  return NextResponse.json({ data });
}
