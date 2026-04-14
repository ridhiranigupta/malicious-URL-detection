import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request-context";
import { auditLog } from "@/lib/server/audit";

function csvEscape(value: string | number) {
  const str = String(value ?? "");
  if (/[,"\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const ip = getClientIp(request);
  const limit = checkRateLimit(`history-export:${session.user.id}:${ip}`, 20, 60_000);
  if (!limit.allowed) {
    return new Response("Too many requests", { status: 429 });
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
    take: 1000,
  });

  const rows = [
    ["Date", "URL", "RiskScore", "ConfidenceScore", "Label"],
    ...scans.map((scan) => [
      new Date(scan.createdAt).toISOString(),
      scan.normalizedUrl,
      scan.riskScore,
      scan.confidenceScore,
      scan.label,
    ]),
  ];

  const csv = rows.map((row) => row.map((cell) => csvEscape(cell)).join(",")).join("\n");

  await auditLog({
    userId: session.user.id,
    route: "/api/history/export",
    method: "GET",
    statusCode: 200,
    message: "History exported",
    metadata: { count: scans.length },
  });

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=scan-history-${Date.now()}.csv`,
    },
  });
}
