"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, History, Radar, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/dashboard", label: "Dashboard", icon: Radar },
  { href: "/history", label: "History", icon: History },
  { href: "/auth/login", label: "Auth", icon: Shield },
];

export function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040712] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-cyan-400/20 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold tracking-widest text-cyan-200">
            <Shield className="h-5 w-5" />
            CYBERSHIELD AI
          </Link>
          <nav className="flex items-center gap-2">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition",
                    pathname === link.href
                      ? "bg-cyan-400/20 text-cyan-100"
                      : "text-slate-300 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <span className="ml-2 inline-flex items-center gap-2 rounded-full border border-violet-300/30 bg-violet-500/10 px-3 py-1 text-xs text-violet-100">
              <Bot className="h-3.5 w-3.5" />
              AI Assistant
            </span>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  );
}
