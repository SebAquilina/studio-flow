import { test, expect } from "@playwright/test";
const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test("[HIGH] home loads with hero + capacity", async ({ page }) => {
  const res = await page.goto(`${BASE}/`);
  expect(res?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText(/Currently booking/i)).toBeVisible();
});

test("[HIGH] /pricing has all 3 tiers", async ({ page }) => {
  await page.goto(`${BASE}/pricing`);
  await expect(page.getByText(/€2,400/)).toBeVisible();
  await expect(page.getByText(/€4,800/)).toBeVisible();
  await expect(page.getByText(/€9,600/)).toBeVisible();
});

test("[CRITICAL] /admin returns 401 with WWW-Authenticate", async ({ request }) => {
  const r = await request.get(`${BASE}/admin`, { failOnStatusCode: false });
  expect(r.status()).toBe(401);
  expect(r.headers()["www-authenticate"]).toMatch(/Basic/);
});
