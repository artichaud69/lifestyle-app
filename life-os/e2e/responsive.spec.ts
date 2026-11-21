import { expect, test } from "@playwright/test";
import { signUpAndOnboard } from "./helpers";

test("core screens fit a phone without horizontal scrolling", async ({ page }) => {
  await signUpAndOnboard(page, "Mo");
  for (const path of ["/", "/today", "/life/goals", "/life/journal", "/projects", "/advisor", "/memory", "/settings", "/insights"]) {
    await page.goto(path);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, `${path} overflows horizontally`).toBeLessThanOrEqual(1);
  }
  await expect(page.getByRole("navigation", { name: "Primary" }).last()).toBeVisible();
});
