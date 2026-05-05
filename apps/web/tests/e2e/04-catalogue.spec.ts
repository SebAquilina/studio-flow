import { test, expect } from "@playwright/test";

test("home shows three project tiles + three packages", async ({ page }) => {
  await page.goto("/");
  await page.locator("#work").scrollIntoViewIfNeeded();
  const tiles = page.locator(".work-tile");
  await expect(tiles).toHaveCount(3);
  await page.locator("#rates").scrollIntoViewIfNeeded();
  const rows = page.locator(".rates-table tbody tr");
  await expect(rows).toHaveCount(3);
  for (const price of ["€450", "€750", "€1,400"]) {
    await expect(page.locator("#rates")).toContainText(price);
  }
});
