import { curiosityUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { deleteCuriosity, updateCuriosity } from "@/server/modules/curiosity/service";

export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  item: await updateCuriosity(user.id, params.id, await readJson(req, curiosityUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await deleteCuriosity(user.id, params.id);
  return { ok: true };
});
