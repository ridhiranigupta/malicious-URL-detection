import { prisma } from "@/lib/db";

type AuditInput = {
  userId?: string;
  route: string;
  method: string;
  statusCode: number;
  message?: string;
  metadata?: unknown;
};

export async function auditLog(input: AuditInput) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: input.userId,
        route: input.route,
        method: input.method,
        statusCode: input.statusCode,
        message: input.message,
        metadata: input.metadata == null ? undefined : JSON.parse(JSON.stringify(input.metadata)),
      },
    });
  } catch {
    // Avoid breaking request lifecycle when audit logging fails.
  }
}
