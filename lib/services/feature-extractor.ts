import { promises as dns } from "node:dns";

const suspiciousKeywords = [
  "verify",
  "signin",
  "wallet",
  "secure",
  "account",
  "update",
  "confirm",
  "bonus",
  "urgent",
  "bank",
  "password",
  "crypto",
];

function shannonEntropy(value: string) {
  const map = new Map<string, number>();
  for (const c of value) {
    map.set(c, (map.get(c) ?? 0) + 1);
  }
  let entropy = 0;
  for (const count of map.values()) {
    const p = count / value.length;
    entropy -= p * Math.log2(p);
  }
  return Number(entropy.toFixed(4));
}

export async function extractUrlFeatures(rawUrl: string) {
  const parsed = new URL(rawUrl);
  const host = parsed.hostname;
  const tokens = parsed.pathname.split(/[\/_\-.?=&]+/).filter(Boolean);

  const hasIpAddress = /^\d{1,3}(\.\d{1,3}){3}$/.test(host);
  const hasAt = rawUrl.includes("@");
  const hasHyphen = host.includes("-");
  const subdomainCount = host.split(".").length - 2;
  const hasManySubdomains = subdomainCount > 2;
  const keywordHits = suspiciousKeywords.filter((word) => rawUrl.toLowerCase().includes(word));

  let dnsResolvable = 0;
  try {
    await dns.lookup(host);
    dnsResolvable = 1;
  } catch {
    dnsResolvable = 0;
  }

  return {
    https: parsed.protocol === "https:",
    urlLength: rawUrl.length,
    hasAt,
    hasHyphen,
    subdomainCount,
    hasManySubdomains,
    keywordHits,
    hasIpAddress,
    entropy: shannonEntropy(rawUrl),
    tokenCount: tokens.length,
    avgTokenLength: tokens.length ? tokens.join("").length / tokens.length : 0,
    dnsResolvable,
    host,
    path: parsed.pathname,
  };
}

export type ExtractedFeatures = Awaited<ReturnType<typeof extractUrlFeatures>>;
