import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request-context";
import { auditLog } from "@/lib/server/audit";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`history:${session.user.id}:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(request.url);
  const query = (url.searchParams.get("query") ?? "").trim();
  const label = (url.searchParams.get("label") ?? "ALL").toUpperCase();

  const labelFilter = label === "SAFE" || label === "SUSPICIOUS" || label === "MALICIOUS" ? label : undefined;

  const scans = await prisma.scan.findMany({
    where: {
      userId: session.user.id,
      ...(query
        ? {
            normalizedUrl: {
              contains: query,
            },
          }
        : {}),
      ...(labelFilter ? { label: labelFilter } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  await auditLog({
    userId: session.user.id,
    route: "/api/history",
    method: "GET",
    statusCode: 200,
    message: "History fetched",
    metadata: { count: scans.length },
  });

  return NextResponse.json({ scans });
}
