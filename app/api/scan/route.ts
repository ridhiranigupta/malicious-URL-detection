import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { analyzeUrl } from "@/lib/services/analyzer";
import { normalizeUrl } from "@/lib/utils";
import { requireUserSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { auditLog } from "@/lib/server/audit";
import { getClientIp } from "@/lib/server/request-context";

const schema = z.object({
  url: z.string().min(4),
});

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value == null) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

function normalizeReasons(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((item) => String(item));
}

export async function POST(request: Request) {
  const auth = await requireUserSession();
  if (!auth.ok) {
    return auth.response;
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`scan:${auth.userId}:${ip}`, 30, 60_000);
  if (!limit.allowed) {
    await auditLog({
      userId: auth.userId,
      route: "/api/scan",
      method: "POST",
      statusCode: 429,
      message: "Rate limit exceeded",
      metadata: { retryAfterMs: limit.retryAfterMs },
    });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    await auditLog({
      userId: auth.userId,
      route: "/api/scan",
      method: "POST",
      statusCode: 400,
      message: "Invalid URL payload",
    });
    return NextResponse.json({ error: "Invalid URL payload" }, { status: 400 });
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(parsed.data.url);
  } catch {
    await auditLog({
      userId: auth.userId,
      route: "/api/scan",
      method: "POST",
      statusCode: 400,
      message: "Invalid URL format",
      metadata: { url: parsed.data.url },
    });
    return NextResponse.json({ error: "URL is not valid" }, { status: 400 });
  }

  const analysis = await analyzeUrl(normalizedUrl);

  const scan = await prisma.scan.create({
    data: {
      userId: auth.userId,
      url: parsed.data.url,
      normalizedUrl,
      riskScore: analysis.riskScore,
      confidenceScore: analysis.confidenceScore,
      label: analysis.label,
      reasons: toJsonValue(analysis.reasons) ?? [],
      explainabilityJson: analysis.explainability,
      screenshotUrl: analysis.screenshotUrl,
      whoisJson: toJsonValue(analysis.whois),
      sslJson: toJsonValue(analysis.ssl),
      safeBrowsingJson: toJsonValue(analysis.safeBrowsing),
    },
  });

  return NextResponse.json(
    {
      scan: {
        ...scan,
        reasons: normalizeReasons(scan.reasons),
      },
    },
    { status: 201 },
  );
}
