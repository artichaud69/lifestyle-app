import { valueUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { deleteValue, updateValue } from "@/server/modules/values/service";

export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  value: await updateValue(user.id, params.id, await readJson(req, valueUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await deleteValue(user.id, params.id);
  return { ok: true };
});
