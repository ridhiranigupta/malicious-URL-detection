import tls from "node:tls";
import whois from "whois-json";

export async function fetchWhois(url: string) {
  const hostname = new URL(url).hostname;
  try {
    const result = await whois(hostname);
    return result;
  } catch {
    return null;
  }
}

export async function fetchSslSummary(url: string) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") {
    return {
      valid: false,
      reason: "URL does not use HTTPS",
    };
  }

  const port = parsed.port ? Number(parsed.port) : 443;

  return await new Promise<Record<string, unknown>>((resolve) => {
    const socket = tls.connect(
      {
        host: parsed.hostname,
        port,
        servername: parsed.hostname,
        rejectUnauthorized: false,
      },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        resolve({
          valid: Boolean(cert?.valid_to),
          issuedTo: cert?.subject?.CN,
          issuedBy: cert?.issuer?.CN,
          validFrom: cert?.valid_from,
          validTo: cert?.valid_to,
          fingerprint: cert?.fingerprint256,
        });
      },
    );

    socket.on("error", () => {
      resolve({
        valid: false,
        reason: "Unable to inspect SSL certificate",
      });
    });
  });
}

export async function fetchSafeBrowsing(url: string) {
  if (!process.env.GOOGLE_SAFE_BROWSING_API_KEY) {
    return null;
  }

  const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_API_KEY}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client: {
        clientId: "malicious-url-detection-platform",
        clientVersion: "1.0.0",
      },
      threatInfo: {
        threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }],
      },
    }),
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function fetchScreenshot(url: string) {
  const endpoint = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=false&embed=screenshot.url`;
  try {
    const response = await fetch(endpoint);
    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return null;
    }

    const json = (await response.json()) as {
      status: string;
      data?: { screenshot?: { url?: string } | string };
    };

    if (json.status !== "success") {
      return null;
    }

    const screenshot = json.data?.screenshot;
    if (typeof screenshot === "string") {
      return screenshot;
    }

    return screenshot?.url ?? null;
  } catch {
    return null;
  }
}
