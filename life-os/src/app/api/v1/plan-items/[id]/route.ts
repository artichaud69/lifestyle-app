import { planItemUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { deletePlanItem, updatePlanItem } from "@/server/modules/planning/service";

export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  item: await updatePlanItem(user.id, params.id, await readJson(req, planItemUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await deletePlanItem(user.id, params.id);
  return { ok: true };
});
