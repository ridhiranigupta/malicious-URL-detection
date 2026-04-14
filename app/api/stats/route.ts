import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireUserSession } from "@/lib/server/auth";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request-context";

export async function GET(request: Request) {
  const auth = await requireUserSession();
  if (!auth.ok) {
    return auth.response;
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`stats:${auth.userId}:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const scans = await prisma.scan.findMany({
    where: { userId: auth.userId },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const totals = {
    all: scans.length,
    safe: scans.filter((scan) => scan.label === "SAFE").length,
    suspicious: scans.filter((scan) => scan.label === "SUSPICIOUS").length,
    malicious: scans.filter((scan) => scan.label === "MALICIOUS").length,
  };

  const avgRisk = scans.length
    ? Number((scans.reduce((sum, scan) => sum + scan.riskScore, 0) / scans.length).toFixed(2))
    : 0;

  const avgConfidence = scans.length
    ? Number((scans.reduce((sum, scan) => sum + scan.confidenceScore, 0) / scans.length).toFixed(2))
    : 0;

  return NextResponse.json({
    totals,
    avgRisk,
    avgConfidence,
  });
}
