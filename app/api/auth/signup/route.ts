import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/server/rate-limit";
import { auditLog } from "@/lib/server/audit";
import { getClientIp } from "@/lib/server/request-context";

const schema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(120),
});

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`signup:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    await auditLog({ route: "/api/auth/signup", method: "POST", statusCode: 400, message: "Invalid signup payload" });
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const email = parsed.data.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await auditLog({ route: "/api/auth/signup", method: "POST", statusCode: 409, message: "Duplicate email" });
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  await auditLog({
    userId: user.id,
    route: "/api/auth/signup",
    method: "POST",
    statusCode: 201,
    message: "User signed up",
  });

  return NextResponse.json({ user }, { status: 201 });
}
