"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setIsLoading(false);

    if (!response.ok) {
      toast.error("Signup failed");
      return;
    }

    toast.success("Account created");
    router.push("/auth/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040712] p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-white">Create account</h1>
        <p className="mt-1 text-sm text-slate-300">Start scanning URLs with explainable threat intelligence.</p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input
            placeholder="Analyst name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          />
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          />
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          Already have an account? <Link href="/auth/login" className="text-cyan-200">Login</Link>
        </p>
      </Card>
    </div>
  );
}
