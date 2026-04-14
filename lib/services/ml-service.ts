import { spawn } from "node:child_process";
import path from "node:path";
import type { ExtractedFeatures } from "@/lib/services/feature-extractor";

export type MlOutput = {
  mlProbability: number;
  modelVersion: string;
  factors: Array<{ feature: string; impact: number }>;
};

export async function getMlProbability(features: ExtractedFeatures): Promise<MlOutput> {
  const payload = {
    entropy: features.entropy,
    tokenCount: features.tokenCount,
    avgTokenLength: features.avgTokenLength,
    subdomainCount: features.subdomainCount,
    hasIpAddress: features.hasIpAddress ? 1 : 0,
    https: features.https ? 1 : 0,
    urlLength: features.urlLength,
  };

  const pythonBin = process.env.PYTHON_BIN || "python";
  const scriptPath = path.join(process.cwd(), "ml", "predict.py");

  try {
    const output = await runPython(pythonBin, scriptPath, JSON.stringify(payload));
    return JSON.parse(output) as MlOutput;
  } catch {
    const fallbackProbability = Math.min(0.95, Math.max(0.05, payload.entropy / 8));
    return {
      mlProbability: Number(fallbackProbability.toFixed(3)),
      modelVersion: "fallback-heuristic",
      factors: [
        { feature: "entropy", impact: payload.entropy / 8 },
        { feature: "tokenCount", impact: payload.tokenCount / 20 },
      ],
    };
  }
}

function runPython(bin: string, scriptPath: string, args: string) {
  return new Promise<string>((resolve, reject) => {
    const proc = spawn(bin, [scriptPath, args]);
    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolve(stdout.trim());
        return;
      }
      reject(new Error(stderr || `Python script exited with code ${code}`));
    });

    proc.on("error", reject);
  });
}
