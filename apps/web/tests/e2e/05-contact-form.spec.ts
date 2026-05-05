import { test, expect } from "@playwright/test";

test("contact form happy path", async ({ page }) => {
  await page.goto("/");
  await page.locator("#book").scrollIntoViewIfNeeded();
  await page.getByLabel("Your name").fill("Playwright Visitor");
  await page.getByLabel("Email").fill("playwright@example.com");
  await page.getByLabel("Project type").selectOption({ label: "Residential" });
  await page.getByLabel("Notes").fill("E2E smoke test from CI.");
  await page.getByLabel(/OK to use my details/).check();
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page).toHaveURL(/\?ok=1&id=lead-/);
});
