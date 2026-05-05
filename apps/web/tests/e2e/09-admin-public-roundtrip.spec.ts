import { test, expect } from "@playwright/test";

/**
 * Admin → Public roundtrip — for every admin section that writes to D1,
 * verify the change reaches the public surface within one request.
 *
 * Per ref 25 + ref 35 (admin-public roundtrip SOP).
 *
 * Skipped by default (SKIP_ADMIN_ROUNDTRIP=1) because it requires admin
 * basic-auth credentials. Run against live with:
 *   ADMIN_USER=seb ADMIN_PASS=... \
 *   PLAYWRIGHT_BASE_URL=https://concierge-studio-web.pages.dev \
 *   pnpm test:e2e tests/e2e/09-admin-public-roundtrip.spec.ts
 */

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const ADMIN_USER = process.env.ADMIN_USER ?? "seb";
const ADMIN_PASS = process.env.ADMIN_PASS ?? "";
const SKIP = process.env.SKIP_ADMIN_ROUNDTRIP === "1" || !ADMIN_PASS;

function authHeader(): Record<string, string> {
  const tok = Buffer.from(`${ADMIN_USER}:${ADMIN_PASS}`).toString("base64");
  return { Authorization: `Basic ${tok}` };
}

test.describe("admin -> public roundtrip", () => {
  test.skip(SKIP, "SKIP_ADMIN_ROUNDTRIP=1 or ADMIN_PASS not set");

  test("[CRITICAL] capacity: changing label updates home hero strip", async ({ request }) => {
    const before = await request
      .get(`${BASE}/api/admin/capacity`, { headers: authHeader() })
      .then((r) => r.json() as Promise<{ capacity: Record<string, unknown> }>);
    const original = before.capacity;
    const probeLabel = `roundtrip-${Date.now()}`;

    const writeRes = await request.post(`${BASE}/api/admin/capacity`, {
      headers: { ...authHeader(), "content-type": "application/json" },
      data: { ...original, next_available_label: probeLabel },
    });
    expect(writeRes.status()).toBeLessThan(400);

    try {
      // Wait briefly for revalidate, then check the HTML
      await new Promise((r) => setTimeout(r, 3000));
      const html = await request.get(`${BASE}/?cb=${Date.now()}`).then((r) => r.text());
      expect(html, "probe label should appear in capacity strip").toContain(probeLabel);
    } finally {
      await request.post(`${BASE}/api/admin/capacity`, {
        headers: { ...authHeader(), "content-type": "application/json" },
        data: original,
      });
    }
  });

  test("[CRITICAL] capacity: change reaches Front agent system prompt", async ({ request }) => {
    // Set a recognizable label, then ask Front "when can you start"
    const before = await request
      .get(`${BASE}/api/admin/capacity`, { headers: authHeader() })
      .then((r) => r.json() as Promise<{ capacity: Record<string, unknown> }>);
    const original = before.capacity;
    const probeLabel = `Test-Month-${Math.floor(Math.random() * 10000)}`;

    await request.post(`${BASE}/api/admin/capacity`, {
      headers: { ...authHeader(), "content-type": "application/json" },
      data: { ...original, next_available_label: probeLabel },
    });

    try {
      await new Promise((r) => setTimeout(r, 5000));
      const reply = await request
        .post(`${BASE}/api/agent`, {
          headers: { "content-type": "application/json" },
          data: { messages: [{ role: "user", content: "When can you start?" }] },
        })
        .then((r) => r.json() as Promise<{ ok: boolean; content?: string }>);
      // Only assert content if agent isn't in fallback (no key)
      if (!(reply as { fallback?: boolean }).fallback) {
        expect(reply.content ?? "").toContain(probeLabel);
      } else {
        test.skip(true, "Front in fallback (no GEMINI_API_KEY) — capacity-into-prompt cannot be exercised");
      }
    } finally {
      await request.post(`${BASE}/api/admin/capacity`, {
        headers: { ...authHeader(), "content-type": "application/json" },
        data: original,
      });
    }
  });
});
