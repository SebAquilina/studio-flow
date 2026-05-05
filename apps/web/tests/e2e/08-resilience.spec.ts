import { test, expect } from "@playwright/test";

test("agent fallback path renders gracefully", async ({ page }) => {
  await page.goto("/");
  // Intercept /api/agent and force a 500 — verify Lina shows the
  // graceful fallback line, no console crash.
  await page.route("**/api/agent", (route) => route.fulfill({ status: 500, body: "boom" }));
  const input = page.getByLabel("Message Lina");
  await input.fill("hello");
  await input.press("Enter");
  const reply = page.locator(".front-hero-msg.is-asst").last();
  await expect(reply).toContainText(/portfolio@concierge\.studio/i, { timeout: 12000 });
});
