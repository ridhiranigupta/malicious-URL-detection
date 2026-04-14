import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="scan-glow max-w-xl rounded-3xl border border-cyan-400/25 bg-slate-950/70 p-9 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cyan-300/30 bg-cyan-400/10 text-cyan-200">
          <Compass className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-5xl font-bold text-white">404</h1>
        <p className="mt-3 text-slate-300">This resource was not found in the CyberShield intelligence graph.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild>
            <Link href="/dashboard">Back To Dashboard</Link>
          </Button>
          <Button asChild variant="ghost" className="border border-cyan-400/30">
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
