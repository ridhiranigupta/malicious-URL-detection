const baseUrl = process.env.SMOKE_BASE_URL || "http://localhost:3000";

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    redirect: "manual",
    ...options,
  });
  let body = "";
  try {
    body = await response.text();
  } catch {
    body = "";
  }
  return { status: response.status, body };
}

function assertStatus(result, accepted, label) {
  if (!accepted.includes(result.status)) {
    throw new Error(`${label} failed. Expected ${accepted.join("/")}, got ${result.status}. Body: ${result.body}`);
  }
  console.log(`PASS ${label} -> ${result.status}`);
}

function assertProtected(result, label) {
  const redirectStatuses = [301, 302, 303, 307, 308];
  if (result.status === 401 || redirectStatuses.includes(result.status)) {
    console.log(`PASS ${label} -> ${result.status}`);
    return;
  }

  const isLoginHtml =
    result.status === 200 &&
    typeof result.body === "string" &&
    (result.body.includes("Access your threat intelligence dashboard") || result.body.includes("Login"));

  if (isLoginHtml) {
    console.log(`PASS ${label} -> 200 (login redirect page)`);
    return;
  }

  throw new Error(`${label} failed. Expected unauthorized or redirect, got ${result.status}. Body: ${result.body}`);
}

async function main() {
  console.log(`Running smoke tests against ${baseUrl}`);

  const health = await request("/api/health");
  assertStatus(health, [200, 503], "GET /api/health");

  let dbAvailable = false;
  try {
    const healthJson = JSON.parse(health.body || "{}");
    dbAvailable = healthJson.database === "connected";
  } catch {
    dbAvailable = false;
  }

  if (!dbAvailable) {
    console.warn("WARN database not connected; skipping DB-dependent smoke checks.");
  }

  const session = await request("/api/auth/session");
  assertStatus(session, [200], "GET /api/auth/session");

  if (dbAvailable) {
    const signup = await request("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Smoke Test User",
        email: `smoke-${Date.now()}@example.com`,
        password: "SmokeTest@123",
      }),
    });
    assertStatus(signup, [201, 409], "POST /api/auth/signup");
  }

  const protectedChecks = [
    ["POST", "/api/scan", { url: "https://example.com" }],
    ["POST", "/api/scan/bulk", { urls: ["https://example.com"] }],
    ["POST", "/api/chat", { message: "Is this URL safe?" }],
    ["POST", "/api/whois", { url: "https://example.com" }],
    ["POST", "/api/screenshot", { url: "https://example.com" }],
    ["GET", "/api/history", null],
    ["GET", "/api/history/export", null],
    ["GET", "/api/stats", null],
  ];

  for (const [method, path, payload] of protectedChecks) {
    const result = await request(path, {
      method,
      headers: payload ? { "Content-Type": "application/json" } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    assertProtected(result, `${method} ${path} (unauthenticated)`);
  }

  console.log("Smoke test suite completed successfully.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
