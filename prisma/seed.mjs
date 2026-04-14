import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@cybershield.local";
  const passwordHash = await hash("Demo@12345", 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: "CyberShield Demo User",
      passwordHash,
    },
    create: {
      name: "CyberShield Demo User",
      email,
      passwordHash,
    },
  });

  const existing = await prisma.scan.count({ where: { userId: user.id } });
  if (existing === 0) {
    await prisma.scan.createMany({
      data: [
        {
          userId: user.id,
          url: "https://secure-update-account-example.com",
          normalizedUrl: "https://secure-update-account-example.com/",
          riskScore: 86,
          confidenceScore: 92,
          label: "MALICIOUS",
          reasons: ["Suspicious keywords detected", "Excessive subdomain depth"],
          explainabilityJson: {
            rulesScore: 72,
            mlScore: 90,
            features: { entropy: 4.2, tokenCount: 8, https: true },
            mlFactors: [
              { feature: "entropy", impact: 0.74 },
              { feature: "subdomainCount", impact: 0.55 },
            ],
          },
        },
        {
          userId: user.id,
          url: "https://github.com",
          normalizedUrl: "https://github.com/",
          riskScore: 12,
          confidenceScore: 80,
          label: "SAFE",
          reasons: ["No high-risk patterns detected"],
          explainabilityJson: {
            rulesScore: 8,
            mlScore: 14,
            features: { entropy: 2.1, tokenCount: 1, https: true },
            mlFactors: [{ feature: "https", impact: -0.75 }],
          },
        },
      ],
    });
  }

  console.log("Seed complete.");
  console.log("Demo login:");
  console.log("Email: demo@cybershield.local");
  console.log("Password: Demo@12345");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
