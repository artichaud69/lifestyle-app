import { expect, type Page } from "@playwright/test";

export async function signUpAndOnboard(page: Page, name = "Lucas") {
  const email = `e2e-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`;
  await page.goto("/signup");
  await page.getByLabel("What should LIFE OS call you?").fill(name);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill("a long test passphrase");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/onboarding/);
  await page.getByRole("button", { name: "Plan my days and weeks realistically" }).click();
  await page.getByLabel(/Current priorities/).fill("Recover after a demanding quarter");
  await page.getByRole("button", { name: "Start using LIFE OS" }).click();
  await expect(page.getByRole("heading", { name: `Good to see you, ${name}.` })).toBeVisible();
  return email;
}
