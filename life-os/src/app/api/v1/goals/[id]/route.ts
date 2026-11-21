import { goalUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { archiveGoal, getGoal, updateGoal } from "@/server/modules/goals/service";

export const GET = authed<{ id: string }>(async ({ user, params }) => ({ goal: await getGoal(user.id, params.id) }));
export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  goal: await updateGoal(user.id, params.id, await readJson(req, goalUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await archiveGoal(user.id, params.id);
  return { ok: true };
});
