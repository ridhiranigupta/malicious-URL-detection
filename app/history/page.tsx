"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { SiteShell } from "@/components/layout/site-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RiskTrendChart } from "@/components/charts/risk-trend-chart";

type Scan = {
  id: string;
  normalizedUrl: string;
  riskScore: number;
  label: "SAFE" | "SUSPICIOUS" | "MALICIOUS";
  createdAt: string;
};

export default function HistoryPage() {
  const [data, setData] = useState<Scan[]>([]);
  const [query, setQuery] = useState("");
  const [label, setLabel] = useState<"ALL" | "SAFE" | "SUSPICIOUS" | "MALICIOUS">("ALL");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("query", query.trim());
    }
    if (label !== "ALL") {
      params.set("label", label);
    }

    fetch(`/api/history?${params.toString()}`)
      .then((res) => res.json())
      .then((json: { scans: Scan[] }) => setData(Array.isArray(json.scans) ? json.scans : []))
      .catch(() => setData([]))
      .finally(() => setIsLoading(false));
  }, [query, label]);

  const filtered = useMemo(() => {
    return data;
  }, [data]);

  function exportCsv() {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.set("query", query.trim());
    }
    if (label !== "ALL") {
      params.set("label", label);
    }
    window.open(`/api/history/export?${params.toString()}`, "_blank", "noopener,noreferrer");
  }

  return (
    <SiteShell>
      <div className="space-y-6">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-white">Scan History & Insights</h1>
          <p className="mt-1 text-sm text-slate-300">Track risk trends and revisit previous URL intelligence.</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search scanned URLs"
              className="max-w-md"
            />
            <select
              value={label}
              onChange={(event) => setLabel(event.target.value as "ALL" | "SAFE" | "SUSPICIOUS" | "MALICIOUS")}
              className="h-12 rounded-xl border border-cyan-300/25 bg-slate-950/70 px-4 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            >
              <option value="ALL">All labels</option>
              <option value="SAFE">Safe</option>
              <option value="SUSPICIOUS">Suspicious</option>
              <option value="MALICIOUS">Malicious</option>
            </select>
            <Button variant="ghost" onClick={exportCsv}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white">Risk trend</h2>
          <RiskTrendChart data={filtered} />
        </Card>

        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Risk</th>
                <th className="px-4 py-3">Label</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td className="px-4 py-6 text-slate-300" colSpan={4}>
                    Loading scan history...
                  </td>
                </tr>
              ) : null}
              {!isLoading && filtered.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-slate-300" colSpan={4}>
                    No scans found for your current filters.
                  </td>
                </tr>
              ) : null}
              {filtered.map((scan) => (
                <tr key={scan.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <Link href={`/results/${scan.id}`} className="text-cyan-200 hover:text-cyan-100">
                      {scan.normalizedUrl}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{scan.riskScore}</td>
                  <td className="px-4 py-3">{scan.label}</td>
                  <td className="px-4 py-3">{new Date(scan.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </SiteShell>
  );
}
