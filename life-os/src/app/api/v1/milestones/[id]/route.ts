import { milestoneUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { deleteMilestone, updateMilestone } from "@/server/modules/goals/service";

export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  milestone: await updateMilestone(user.id, params.id, await readJson(req, milestoneUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await deleteMilestone(user.id, params.id);
  return { ok: true };
});
