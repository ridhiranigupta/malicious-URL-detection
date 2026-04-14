"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type Item = {
  id: string;
  createdAt: string;
  riskScore: number;
};

export function RiskTrendChart({ data }: { data: Item[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartData = data
    .slice(0, 20)
    .reverse()
    .map((item) => ({
      time: new Date(item.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
      risk: item.riskScore,
    }));

  return (
    <div className="h-72 w-full">
      {!mounted ? <div className="h-full w-full rounded-xl bg-white/5" /> : null}
      {mounted ? (
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="riskFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
          <XAxis dataKey="time" stroke="#94a3b8" />
          <YAxis domain={[0, 100]} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.95)",
              border: "1px solid rgba(34,211,238,0.4)",
              borderRadius: 12,
              color: "#e2e8f0",
            }}
          />
          <Area type="monotone" dataKey="risk" stroke="#22d3ee" strokeWidth={3} fill="url(#riskFill)" />
        </AreaChart>
      </ResponsiveContainer>
      ) : null}
    </div>
  );
}
