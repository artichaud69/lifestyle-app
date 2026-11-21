import { memoryUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { deleteMemory, explainMemory, updateMemory } from "@/server/modules/memory/service";

// GET answers "why do you believe this about me?" with resolved sources.
export const GET = authed<{ id: string }>(async ({ user, params }) => ({ memory: await explainMemory(user.id, params.id) }));
export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  memory: await updateMemory(user.id, params.id, await readJson(req, memoryUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await deleteMemory(user.id, params.id);
  return { ok: true };
});
