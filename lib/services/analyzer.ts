import { scoreToLabel } from "@/lib/utils";
import { extractUrlFeatures } from "@/lib/services/feature-extractor";
import { getMlProbability } from "@/lib/services/ml-service";
import {
  fetchSafeBrowsing,
  fetchScreenshot,
  fetchSslSummary,
  fetchWhois,
} from "@/lib/services/threat-intel";

export async function analyzeUrl(url: string) {
  const features = await extractUrlFeatures(url);
  const ml = await getMlProbability(features);

  let rulesScore = 0;
  const reasons: string[] = [];

  if (features.urlLength > 90) {
    rulesScore += 14;
    reasons.push("URL is unusually long");
  }
  if (features.hasAt) {
    rulesScore += 16;
    reasons.push("Contains @ symbol, often used to obfuscate links");
  }
  if (features.hasIpAddress) {
    rulesScore += 18;
    reasons.push("Uses direct IP address instead of domain name");
  }
  if (features.hasManySubdomains) {
    rulesScore += 12;
    reasons.push("Contains excessive subdomain depth");
  }
  if (!features.https) {
    rulesScore += 12;
    reasons.push("Does not use HTTPS encryption");
  }
  if (features.keywordHits.length) {
    rulesScore += Math.min(20, features.keywordHits.length * 4);
    reasons.push(`Suspicious keywords detected: ${features.keywordHits.join(", ")}`);
  }

  const mlScore = Math.round(ml.mlProbability * 100);
  const riskScore = Math.min(100, Math.round(rulesScore * 0.45 + mlScore * 0.55));
  const confidenceScore = Math.min(99, Math.max(55, Math.round(65 + Math.abs(mlScore - 50) / 2 + reasons.length * 2)));

  const threatResults = await Promise.allSettled([
    fetchWhois(url),
    fetchSslSummary(url),
    fetchSafeBrowsing(url),
    fetchScreenshot(url),
  ]);

  const whoisData = threatResults[0].status === "fulfilled" ? threatResults[0].value : null;
  const sslData = threatResults[1].status === "fulfilled" ? threatResults[1].value : null;
  const safeBrowsingData = threatResults[2].status === "fulfilled" ? threatResults[2].value : null;
  const screenshotUrl = threatResults[3].status === "fulfilled" ? threatResults[3].value : null;

  if (safeBrowsingData && "matches" in (safeBrowsingData as Record<string, unknown>)) {
    reasons.push("Google Safe Browsing reported threat matches");
  }

  return {
    riskScore,
    confidenceScore,
    label: scoreToLabel(riskScore),
    reasons,
    explainability: {
      rulesScore,
      mlScore,
      mlFactors: ml.factors,
      features,
    },
    whois: whoisData,
    ssl: sslData,
    safeBrowsing: safeBrowsingData,
    screenshotUrl,
  };
}
