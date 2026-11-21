import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { setAiProviderForTests } from "@/server/ai";
import { confirmCapture, createCapture, discardCapture, listPendingCaptures } from "@/server/modules/capture/service";
import { getDashboard } from "@/server/modules/dashboard/service";
import { ask } from "@/server/modules/advisor/service";
import { updateTask } from "@/server/modules/tasks/service";
import { explainMemory } from "@/server/modules/memory/service";
import { FakeProvider, makeUser } from "./helpers";

// The first vertical slice, end to end against a real database:
// Quick Capture → Structured Storage → AI Retrieval → Dashboard → User Editing.
describe("capture → storage → retrieval → dashboard → edit", () => {
  it("files a confirmed task, shows it on the dashboard, retrieves it for the advisor, and accepts edits", async () => {
    const user = await makeUser();

    const capture = await createCapture(user.id, "Remind me to call the dentist today");
    expect(capture.status).toBe("PROPOSED");
    expect(capture.classifier).toBe("RULES"); // no consent → never sent to a provider
    expect(capture.proposal).toMatchObject({ type: "task", title: "Call the dentist" });
    expect(await db.task.count({ where: { userId: user.id } })).toBe(0); // nothing filed before confirmation

    const filed = await confirmCapture(user.id, capture.id, capture.proposal!);
    expect(filed.resultType).toBe("task");
    const task = await db.task.findUniqueOrThrow({ where: { id: filed.resultId } });
    expect(task.captureId).toBe(capture.id); // provenance
    expect((await db.capture.findUniqueOrThrow({ where: { id: capture.id } })).status).toBe("CONFIRMED");

    const dash = await getDashboard(user.id);
    expect(dash.dueTasks.map((t) => t.id)).toContain(task.id);

    const answer = await ask(user.id, { message: "When is the dentist?" });
    expect(answer.generator).toBe("offline");
    expect(answer.contextRefs.some((r) => r.kind === "task" && r.id === task.id)).toBe(true);
    expect(answer.message.content).toContain("Call the dentist");

    await updateTask(user.id, task.id, { title: "Call the dentist about the crown", status: "DONE" });
    const after = await getDashboard(user.id);
    expect(after.dueTasks.map((t) => t.id)).not.toContain(task.id);
    expect((await db.task.findUniqueOrThrow({ where: { id: task.id } })).completedAt).not.toBeNull();
  });

  it("lets the user change the destination before confirming", async () => {
    const user = await makeUser();
    const c = await createCapture(user.id, "I would love to build a tool to analyse my running performance");
    expect(c.proposal?.type).toBe("project");
    const res = await confirmCapture(user.id, c.id, { type: "goal", title: "Understand my running", domainKey: "health", motivation: null });
    expect(res.resultType).toBe("goal");
    const goal = await db.goal.findUniqueOrThrow({ where: { id: res.resultId }, include: { domain: true } });
    expect(goal.domain?.key).toBe("health");
  });

  it("stores chosen leisure as a plan item, not a task", async () => {
    const user = await makeUser();
    const c = await createCapture(user.id, "Tonight I want to play Minecraft for two hours");
    expect(c.proposal).toMatchObject({ type: "leisure", minutes: 120 });
    const res = await confirmCapture(user.id, c.id, c.proposal!);
    const item = await db.dailyPlanItem.findUniqueOrThrow({ where: { id: res.resultId } });
    expect(item.kind).toBe("LEISURE");
    expect(await db.task.count({ where: { userId: user.id } })).toBe(0);
  });

  it("records memory provenance back to the capture", async () => {
    const user = await makeUser();
    const c = await createCapture(user.id, "I work best in the morning");
    expect(c.proposal?.type).toBe("memory");
    const res = await confirmCapture(user.id, c.id, c.proposal!);
    const m = await explainMemory(user.id, res.resultId);
    expect(m.status).toBe("USER_STATED");
    expect(m.layer).toBe("PROFILE");
    expect(m.sources[0]).toMatchObject({ sourceType: "CAPTURE", sourceId: c.id });
    expect(m.sources[0]!.label).toContain("I work best in the morning");
  });

  it("refuses to file a capture twice, and discarding removes it from the inbox", async () => {
    const user = await makeUser();
    const c = await createCapture(user.id, "Buy milk");
    await confirmCapture(user.id, c.id, c.proposal!);
    await expect(confirmCapture(user.id, c.id, c.proposal!)).rejects.toMatchObject({ code: "CONFLICT" });

    const d = await createCapture(user.id, "Something vague");
    await discardCapture(user.id, d.id);
    expect((await listPendingCaptures(user.id)).map((x) => x.id)).not.toContain(d.id);
  });

  it("uses the AI provider only with consent, and falls back to rules when it fails", async () => {
    const noConsent = await makeUser({ consent: false });
    const fake = new FakeProvider({ type: "curiosity", question: "How did Roman logistics work?" });
    setAiProviderForTests(fake);

    await createCapture(noConsent.id, "How did Roman logistics work?");
    expect(fake.calls.classify).toHaveLength(0);

    const consented = await makeUser({ consent: true });
    const viaAi = await createCapture(consented.id, "How did Roman logistics work?");
    expect(viaAi.classifier).toBe("AI");
    expect(fake.calls.classify).toEqual(["How did Roman logistics work?"]);

    setAiProviderForTests(new FakeProvider(undefined, true));
    const fallback = await createCapture(consented.id, "Call mum tomorrow");
    expect(fallback.classifier).toBe("RULES");
    expect(fallback.aiError).toBeTruthy();
    expect(fallback.proposal?.type).toBe("task");
  });

  it("falls back to rules when the AI returns an invalid proposal", async () => {
    const user = await makeUser({ consent: true });
    setAiProviderForTests(new FakeProvider({ type: "leisure", title: "Gaming", dueDate: "not-a-date" }));
    const c = await createCapture(user.id, "Buy a birthday present for Emma");
    expect(c.classifier).toBe("RULES");
    expect(c.proposal?.type).toBe("task");
  });
});
