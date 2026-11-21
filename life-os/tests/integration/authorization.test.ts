import { describe, expect, it } from "vitest";
import { createCapture, confirmCapture } from "@/server/modules/capture/service";
import { createTask, getTask, updateTask, archiveTask } from "@/server/modules/tasks/service";
import { createJournalEntry, deleteJournalEntry, getJournalEntry } from "@/server/modules/journal/service";
import { createGoal, updateGoal } from "@/server/modules/goals/service";
import { createMemory, updateMemory, deleteMemory } from "@/server/modules/memory/service";
import { addPlanItem, updatePlanItem } from "@/server/modules/planning/service";
import { ask, getConversation } from "@/server/modules/advisor/service";
import { retrieveContext } from "@/server/modules/retrieval/service";
import { DEFAULT_SCOPES } from "@/server/modules/settings/service";
import { revokeSession, createSession, validateSessionToken } from "@/server/auth/session";
import { makeUser } from "./helpers";

// Every protected resource must be invisible to other users: reads and writes
// with someone else's id fail as NOT_FOUND (no existence leak).
describe("authorization boundaries", () => {
  it("isolates every record type between users", async () => {
    const alice = await makeUser();
    const bob = await makeUser();
    const nf = { code: "NOT_FOUND" };

    const task = await createTask(alice.id, { title: "Alice's secret task" });
    await expect(getTask(bob.id, task.id)).rejects.toMatchObject(nf);
    await expect(updateTask(bob.id, task.id, { title: "pwned" })).rejects.toMatchObject(nf);
    await expect(archiveTask(bob.id, task.id)).rejects.toMatchObject(nf);

    const entry = await createJournalEntry(alice.id, { body: "private thoughts" });
    await expect(getJournalEntry(bob.id, entry.id)).rejects.toMatchObject(nf);
    await expect(deleteJournalEntry(bob.id, entry.id)).rejects.toMatchObject(nf);

    const goal = await createGoal(alice.id, { title: "Alice goal" });
    await expect(updateGoal(bob.id, goal.id, { title: "x" })).rejects.toMatchObject(nf);
    // Cannot attach own task to someone else's goal either.
    await expect(createTask(bob.id, { title: "t", goalId: goal.id })).rejects.toMatchObject(nf);

    const memory = await createMemory(alice.id, { content: "Alice likes tea", layer: "PROFILE" }, { type: "USER" });
    await expect(updateMemory(bob.id, memory.id, { verdict: "reject" })).rejects.toMatchObject(nf);
    await expect(deleteMemory(bob.id, memory.id)).rejects.toMatchObject(nf);

    const item = await addPlanItem(alice.id, "2026-11-21", { kind: "LEISURE", label: "Gaming" });
    await expect(updatePlanItem(bob.id, item.id, { done: true })).rejects.toMatchObject(nf);
    await expect(addPlanItem(bob.id, "2026-11-21", { kind: "MAIN", taskId: task.id })).rejects.toMatchObject(nf);

    const capture = await createCapture(alice.id, "Buy bread");
    await expect(confirmCapture(bob.id, capture.id, capture.proposal!)).rejects.toMatchObject(nf);

    const conv = await ask(alice.id, { message: "hello" });
    await expect(getConversation(bob.id, conv.conversationId)).rejects.toMatchObject(nf);
    await expect(ask(bob.id, { conversationId: conv.conversationId, message: "hi" })).rejects.toMatchObject(nf);
  });

  it("never retrieves another user's records", async () => {
    const alice = await makeUser();
    const bob = await makeUser();
    await createTask(alice.id, { title: "Dentist appointment for Alice" });
    const ctx = await retrieveContext(bob.id, "dentist appointment", DEFAULT_SCOPES, { timezone: "UTC" });
    const all = [...ctx.core, ...ctx.matches];
    expect(all.some((i) => i.text.includes("Alice"))).toBe(false);
    expect(all.filter((i) => i.ref.kind === "task")).toHaveLength(0);
  });

  it("revoked sessions stop authenticating; users cannot revoke others' sessions", async () => {
    const alice = await makeUser();
    const bob = await makeUser();
    const { token, session } = await createSession(alice.id, "test");
    expect(await validateSessionToken(token)).toMatchObject({ id: alice.id });
    expect(await revokeSession(bob.id, session.id)).toBe(false);
    expect(await validateSessionToken(token)).not.toBeNull();
    expect(await revokeSession(alice.id, session.id)).toBe(true);
    expect(await validateSessionToken(token)).toBeNull();
  });
});
