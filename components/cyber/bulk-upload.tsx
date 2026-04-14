"use client";

import Papa from "papaparse";
import { Upload } from "lucide-react";
import { toast } from "sonner";

type BulkResult = {
  results: Array<{ ok: boolean; scan?: { id: string }; url?: string; error?: string }>;
};

export function BulkUpload({ onComplete }: { onComplete: () => void }) {
  async function processFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const text = await file.text();
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: true });
    const urls = parsed.data.map((row) => row[0]).filter(Boolean).slice(0, 25);

    if (!urls.length) {
      toast.error("CSV must include at least one URL column");
      return;
    }

    const response = await fetch("/api/scan/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urls }),
    });

    if (!response.ok) {
      toast.error("Bulk scan failed");
      return;
    }

    const data = (await response.json()) as BulkResult;
    const successCount = data.results.filter((item) => item.ok).length;
    toast.success(`Bulk scan complete: ${successCount}/${data.results.length}`);
    onComplete();
  }

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-cyan-300/30 bg-cyan-500/10 px-4 py-2 text-sm text-cyan-100 transition hover:bg-cyan-500/20">
      <Upload className="h-4 w-4" />
      Upload CSV
      <input type="file" accept=".csv" className="hidden" onChange={processFile} />
    </label>
  );
}
