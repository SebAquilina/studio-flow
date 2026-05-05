import { test, expect } from "@playwright/test";

test("admin auth gate", async ({ request }) => {
  const r = await request.get("/admin/live", { failOnStatusCode: false });
  expect(r.status()).toBe(401);
  expect(r.headers()["www-authenticate"]).toMatch(/Basic/);
});

test("admin leads list authenticated", async ({ request }) => {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
  test.skip(!ADMIN_PASSWORD, "ADMIN_PASSWORD not set");
  const headers = { Authorization: "Basic " + Buffer.from(`seb:${ADMIN_PASSWORD}`).toString("base64") };
  const r = await request.get("/admin/leads", { headers });
  expect(r.status()).toBe(200);
});
