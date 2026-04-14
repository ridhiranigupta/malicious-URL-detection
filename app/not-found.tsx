import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040712] px-6">
      <div className="max-w-lg rounded-2xl border border-cyan-400/25 bg-slate-950/70 p-8 text-center">
        <h1 className="text-4xl font-bold text-white">404</h1>
        <p className="mt-3 text-slate-300">This resource was not found in the CyberShield intelligence graph.</p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Back To Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
