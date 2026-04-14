import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { RiskGauge } from "@/components/cyber/risk-gauge";
import { prisma } from "@/lib/db";

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const scan = await prisma.scan.findUnique({ where: { id } });

  if (!scan) {
    notFound();
  }

  const explainability = scan.explainabilityJson as {
    rulesScore: number;
    mlScore: number;
    features: Record<string, unknown>;
    mlFactors: Array<{ feature: string; impact: number }>;
  };
  const reasons = Array.isArray(scan.reasons) ? scan.reasons.map((item) => String(item)) : [];

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-white">Risk Classification</h1>
          <div className="mt-4 flex items-center gap-6">
            <RiskGauge score={scan.riskScore} />
            <div>
              <Badge>{scan.label}</Badge>
              <p className="mt-3 text-sm text-slate-300">Confidence score: {scan.confidenceScore}%</p>
              <p className="mt-1 text-sm text-slate-300">URL: {scan.normalizedUrl}</p>
            </div>
          </div>

          <div className="mt-6 space-y-2 text-sm text-slate-300">
            <h2 className="text-base font-semibold text-slate-100">Why this was flagged</h2>
            {reasons.map((reason) => (
              <p key={reason}>• {reason}</p>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white">Feature breakdown</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
              {Object.entries(explainability.features).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
                  <span className="text-xs uppercase tracking-wide text-slate-400">{key}</span>
                  <p>{String(value)}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white">Model signals</h2>
            <p className="mt-2 text-sm text-slate-300">Rules score: {explainability.rulesScore}</p>
            <p className="text-sm text-slate-300">ML probability score: {explainability.mlScore}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              {explainability.mlFactors.map((factor) => (
                <p key={factor.feature}>
                  • {factor.feature}: {factor.impact.toFixed(3)} impact
                </p>
              ))}
            </div>
          </Card>

          {scan.screenshotUrl ? (
            <Card className="overflow-hidden">
              <Image src={scan.screenshotUrl} alt="Scanned site preview" width={1200} height={700} className="h-auto w-full" />
            </Card>
          ) : null}
        </div>
      </div>
    </SiteShell>
  );
}
