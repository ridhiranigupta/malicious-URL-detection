import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { analyzeUrl } from "@/lib/services/analyzer";
import { normalizeUrl } from "@/lib/utils";
import { requireUserSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { auditLog } from "@/lib/server/audit";
import { getClientIp } from "@/lib/server/request-context";

const schema = z.object({
  urls: z.array(z.string().min(4)).min(1).max(25),
});

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value == null) {
    return undefined;
  }
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function POST(request: Request) {
  const auth = await requireUserSession();
  if (!auth.ok) {
    return auth.response;
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`bulk:${auth.userId}:${ip}`, 8, 60_000);
  if (!limit.allowed) {
    await auditLog({
      userId: auth.userId,
      route: "/api/scan/bulk",
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
      route: "/api/scan/bulk",
      method: "POST",
      statusCode: 400,
      message: "Invalid bulk payload",
    });
    return NextResponse.json({ error: "Provide 1 to 25 URLs" }, { status: 400 });
  }

  const results = await Promise.all(
    parsed.data.urls.map(async (rawUrl) => {
      try {
        const normalized = normalizeUrl(rawUrl);
        const analysis = await analyzeUrl(normalized);
        const scan = await prisma.scan.create({
          data: {
            userId: auth.userId,
            url: rawUrl,
            normalizedUrl: normalized,
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
        return { ok: true, scan };
      } catch (error) {
        return {
          ok: false,
          url: rawUrl,
          error: error instanceof Error ? error.message : "Failed",
        };
      }
    }),
  );

  await auditLog({
    userId: auth.userId,
    route: "/api/scan/bulk",
    method: "POST",
    statusCode: 201,
    message: "Bulk scan completed",
    metadata: {
      total: results.length,
      success: results.filter((item) => item.ok).length,
    },
  });

  return NextResponse.json({ results }, { status: 201 });
}
