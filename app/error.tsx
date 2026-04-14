"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040712] px-6">
      <div className="max-w-lg rounded-2xl border border-rose-400/25 bg-slate-950/70 p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="mt-3 text-slate-300">An unexpected error occurred while processing this security workflow.</p>
        <Button className="mt-6" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
