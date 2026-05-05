import { test, expect } from "@playwright/test";

test.describe("agent happy path", () => {
  test("rates question gets KB-grounded answer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Ask Lina anything");
    const input = page.getByLabel("Message Lina");
    await input.fill("What are your rates for an apartment in Sliema?");
    await input.press("Enter");
    await expect(page.locator(".front-hero-msg.is-asst").last()).toContainText(/€450|€750|€1,400/, { timeout: 12000 });
  });
});
