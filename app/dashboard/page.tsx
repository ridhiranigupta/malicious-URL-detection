"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, ShieldAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { BulkUpload } from "@/components/cyber/bulk-upload";
import { ChatAssistant } from "@/components/cyber/chat-assistant";
import { RiskGauge } from "@/components/cyber/risk-gauge";
import { SiteShell } from "@/components/layout/site-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type Scan = {
  id: string;
  normalizedUrl: string;
  riskScore: number;
  confidenceScore: number;
  label: "SAFE" | "SUSPICIOUS" | "MALICIOUS";
  reasons: string[];
};

export default function DashboardPage() {
  const [url, setUrl] = useState("");
  const [scan, setScan] = useState<Scan | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function runScan() {
    if (!url.trim()) {
      toast.error("Enter a URL first");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Session expired. Please log in again.");
          return;
        }

        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error || "Scan failed");
      }

      const data = (await response.json()) as { scan: Scan };
      setScan(data.scan);
      toast.success("Scan completed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to scan URL");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Card className="scan-glow p-6">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Threat Scanner</h1>
              <BulkUpload onComplete={() => toast.success("Refresh history to inspect new scans")} />
            </div>
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://example.com/login"
              />
              <Button onClick={runScan} className="min-w-36" disabled={isLoading}>
                <Search className="h-4 w-4" />
                {isLoading ? "Scanning..." : "Scan URL"}
              </Button>
            </div>
            {isLoading ? (
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.2, ease: "linear" }}
                />
              </div>
            ) : null}
          </Card>

          {scan ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-300">Latest result</p>
                    <p className="mt-1 text-lg font-semibold text-white">{scan.normalizedUrl}</p>
                  </div>
                  <Badge
                    className={
                      scan.label === "MALICIOUS"
                        ? "border-rose-300/40 bg-rose-500/15 text-rose-200"
                        : scan.label === "SUSPICIOUS"
                          ? "border-amber-300/40 bg-amber-500/15 text-amber-100"
                          : ""
                    }
                  >
                    {scan.label}
                  </Badge>
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-8">
                  <RiskGauge score={scan.riskScore} />
                  <div className="space-y-2 text-sm text-slate-300">
                    <p>Confidence: {scan.confidenceScore}%</p>
                    <div className="space-y-1">
                      {scan.reasons.slice(0, 4).map((reason) => (
                        <p key={reason}>• {reason}</p>
                      ))}
                    </div>
                    <Link href={`/results/${scan.id}`} className="inline-flex items-center text-cyan-200 hover:text-cyan-100">
                      View full analysis
                    </Link>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <Card className="p-8 text-center text-slate-300">
              <ShieldCheck className="mx-auto h-9 w-9 text-cyan-300" />
              <p className="mt-3">No scans yet. Start by checking a suspicious URL.</p>
            </Card>
          )}
        </motion.section>

        <aside className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-white">Detection stack</h2>
            <div className="mt-3 space-y-2 text-sm text-slate-300">
              <p>• Rule engine: structure, tokens, SSL and URL anomalies</p>
              <p>• ML engine: entropy, domain and token behavior scoring</p>
              <p>• Threat intel: WHOIS, Safe Browsing, screenshot preview</p>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <ShieldAlert className="h-4 w-4" />
              Real-time explainable output
            </div>
          </Card>
          <ChatAssistant />
        </aside>
      </div>
    </SiteShell>
  );
}
