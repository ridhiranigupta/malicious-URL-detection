import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function normalizeUrl(input: string) {
  const prefixed = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  return new URL(prefixed).toString();
}

export function scoreToLabel(score: number): "SAFE" | "SUSPICIOUS" | "MALICIOUS" {
  if (score >= 70) {
    return "MALICIOUS";
  }
  if (score >= 40) {
    return "SUSPICIOUS";
  }
  return "SAFE";
}
