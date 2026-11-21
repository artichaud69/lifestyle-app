import { expect, test } from "@playwright/test";
import { signUpAndOnboard } from "./helpers";

test("quick capture → confirm → dashboard → inline edit → advisor retrieval", async ({ page }) => {
  await signUpAndOnboard(page);

  // 1. Capture: classified, proposed, nothing filed yet.
  const capture = page.getByLabel("Quick capture");
  await capture.fill("Remind me to call the dentist today");
  await capture.press("Enter");
  const proposal = page.getByRole("group", { name: "Capture proposal" });
  await expect(proposal.getByRole("radio", { name: "Task" })).toHaveAttribute("aria-checked", "true");
  await expect(proposal.getByLabel("Task title")).toHaveValue("Call the dentist");

  // 2. Confirm → stored → visible on the dashboard.
  await proposal.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved as a task." })).toBeVisible();
  const today = page.getByRole("region", { name: "Today" });
  await expect(today.getByRole("button", { name: "Edit task title" })).toHaveText("Call the dentist");

  // 3. Inline edit persists across a reload.
  await today.getByRole("button", { name: "Edit task title" }).click();
  await today.getByLabel("task title").fill("Call the dentist about the crown");
  const renamed = page.waitForResponse((r) => r.url().includes("/api/v1/tasks/") && r.request().method() === "PATCH" && r.ok());
  await today.getByLabel("task title").press("Enter");
  await renamed;
  await page.reload();
  await expect(page.getByRole("region", { name: "Today" }).getByRole("button", { name: "Edit task title" })).toHaveText("Call the dentist about the crown");

  // 4. The advisor retrieves the stored record (offline mode: no AI configured).
  await page.goto("/advisor");
  await page.getByLabel("Message the advisor").fill("When am I calling the dentist?");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("not an AI answer").first()).toBeVisible();
  await page.getByText(/Based on \d+ records?/).click();
  await expect(page.getByRole("link", { name: /task · Call the dentist about the crown/ })).toBeVisible();

  // 5. Completing it removes it from today's list.
  await page.goto("/");
  // Wait for the save itself: reloading too early would cancel the request.
  const saved = page.waitForResponse((r) => r.url().includes("/api/v1/tasks/") && r.request().method() === "PATCH" && r.ok());
  await page.getByRole("checkbox", { name: /Mark “Call the dentist about the crown” done/ }).check();
  await saved;
  await page.reload();
  await expect(page.getByRole("region", { name: "Today" }).getByText("Nothing due.")).toBeVisible();
});

test("changing the destination, chosen leisure, and memory correction", async ({ page }) => {
  await signUpAndOnboard(page, "Sam");
  const capture = page.getByLabel("Quick capture");

  await capture.fill("Tonight I want to play Minecraft for two hours");
  await capture.press("Enter");
  let proposal = page.getByRole("group", { name: "Capture proposal" });
  await expect(proposal.getByRole("radio", { name: "Chosen leisure" })).toHaveAttribute("aria-checked", "true");
  await proposal.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("region", { name: "Today" }).getByText("Play Minecraft for two hours")).toBeVisible();

  // Low-confidence input asks the user where it goes; switch it to a goal.
  await capture.fill("the blue one");
  await capture.press("Enter");
  proposal = page.getByRole("group", { name: "Capture proposal" });
  await expect(proposal.getByText("I'm not sure where this belongs")).toBeVisible();
  await proposal.getByRole("radio", { name: "Goal" }).click();
  await proposal.getByLabel("Title").fill("Repaint the shed blue");
  await proposal.getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved as a goal." })).toBeVisible();
  await page.goto("/life/goals");
  await expect(page.getByRole("button", { name: "Edit goal title" })).toHaveText("Repaint the shed blue");

  // Memory: stated by the user, provenance visible, can be marked inaccurate.
  await page.goto("/");
  await capture.fill("I work best in the morning");
  await capture.press("Enter");
  await page.getByRole("group", { name: "Capture proposal" }).getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved as something about you." })).toBeVisible();
  await page.goto("/memory");
  const item = page.locator("li", { hasText: "I work best in the morning" });
  await expect(item.getByText("You said")).toBeVisible();
  await item.getByRole("button", { name: "Why do you believe this?" }).click();
  await expect(item.getByText(/Quick capture: “I work best in the morning”/)).toBeVisible();
  await item.getByRole("button", { name: "Not accurate" }).click();
  await expect(page.getByText(/Marked inaccurate \(1\)/)).toBeVisible();
});

test("records are private to their owner", async ({ page, browser }) => {
  await signUpAndOnboard(page, "Alice");
  await page.getByLabel("Quick capture").fill("Buy flowers for the anniversary");
  await page.getByLabel("Quick capture").press("Enter");
  await page.getByRole("group", { name: "Capture proposal" }).getByRole("button", { name: "Save" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved as a task." })).toBeVisible();
  await page.goto("/today");
  const taskId = (await page.locator("li[id^=task-]").first().getAttribute("id"))!.replace("task-", "");

  const other = await browser.newContext();
  const bob = await other.newPage();
  await signUpAndOnboard(bob, "Bob");
  await bob.goto("/today");
  await expect(bob.getByText("Buy flowers for the anniversary")).toHaveCount(0);
  const res = await bob.request.patch(`/api/v1/tasks/${taskId}`, { data: { title: "hijacked" }, headers: { origin: "http://localhost:3100" } });
  expect(res.status()).toBe(404);
  const cross = await bob.request.post("/api/v1/tasks", { data: { title: "csrf" }, headers: { origin: "https://evil.example" } });
  expect(cross.status()).toBe(403);
  await other.close();
});
