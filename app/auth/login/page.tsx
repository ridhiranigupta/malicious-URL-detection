"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setIsLoading(false);

    if (result?.error) {
      toast.error("Invalid credentials");
      return;
    }

    toast.success("Welcome back");
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#040712] p-6">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold text-white">Login</h1>
        <p className="mt-1 text-sm text-slate-300">Access your threat intelligence dashboard.</p>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <Input type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-slate-300">
          New here? <Link href="/auth/signup" className="text-cyan-200">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
