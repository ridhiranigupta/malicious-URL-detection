import Link from "next/link";
import { Sparkles, Radar, Bot, Database, ShieldCheck } from "lucide-react";
import { GlobeScene } from "@/components/cyber/globe-scene";
import { ParticlesBackground } from "@/components/cyber/particles-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#040712]">
      <ParticlesBackground />
      <div className="grid-overlay absolute inset-0 opacity-50" />

      <main className="relative mx-auto max-w-7xl px-6 py-14 md:py-20">
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-100">
              <Sparkles className="h-3.5 w-3.5" />
              Real-Time Cyber AI Engine
            </div>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-6xl">
              Detect Malicious URLs in Real-Time
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              CyberShield AI combines rule-based intelligence, machine learning, and threat enrichment to detect phishing
              links with explainable confidence and rich forensic context.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/dashboard">Launch Dashboard</Link>
              </Button>
              <Button asChild variant="ghost" size="lg">
                <Link href="/auth/signup">Create Account</Link>
              </Button>
            </div>
          </div>
          <div className="glass-panel rounded-3xl p-4">
            <GlobeScene />
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="p-5">
            <Radar className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-3 text-lg font-semibold text-white">Hybrid Detection</h2>
            <p className="mt-2 text-sm text-slate-300">Rules + ML score URL risk with explainability and confidence.</p>
          </Card>
          <Card className="p-5">
            <Database className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-3 text-lg font-semibold text-white">Threat Intel</h2>
            <p className="mt-2 text-sm text-slate-300">WHOIS, SSL analysis, screenshots, and Safe Browsing integration.</p>
          </Card>
          <Card className="p-5">
            <Bot className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-3 text-lg font-semibold text-white">AI Assistant</h2>
            <p className="mt-2 text-sm text-slate-300">Chatbot explains phishing tactics and recommends safe actions.</p>
          </Card>
          <Card className="p-5">
            <ShieldCheck className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-3 text-lg font-semibold text-white">SOC-Ready UX</h2>
            <p className="mt-2 text-sm text-slate-300">Fast scanning workflow with trends, history, and reusable APIs.</p>
          </Card>
        </section>
      </main>
    </div>
  );
}
