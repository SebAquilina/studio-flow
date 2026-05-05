import { test, expect } from "@playwright/test";

const ADMIN_USER = process.env.ADMIN_USER ?? "seb";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";

test.describe("admin publish round-trip — tastings", () => {
  test("admin tastings list reads through", async ({ request }) => {
    test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not set");
    const headers = { Authorization: "Basic " + Buffer.from(`${ADMIN_USER}:${ADMIN_PASSWORD}`).toString("base64") };
    const r = await request.get("/api/admin/tastings", { headers });
    expect(r.ok()).toBe(true);
    const body = await r.json() as { ok: boolean; sessions: any[]; bookings: any[] };
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.sessions)).toBe(true);
  });
});
