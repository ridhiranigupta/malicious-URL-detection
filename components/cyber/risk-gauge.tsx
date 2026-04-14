"use client";

import { motion } from "framer-motion";

export function RiskGauge({ score }: { score: number }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const tone = score >= 70 ? "#fb7185" : score >= 40 ? "#f59e0b" : "#22d3ee";

  return (
    <div className="relative h-36 w-36">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius} stroke="rgba(148,163,184,0.25)" strokeWidth="12" fill="none" />
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          stroke={tone}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-white">{score}</span>
        <span className="text-xs text-slate-300">Risk</span>
      </div>
    </div>
  );
}
