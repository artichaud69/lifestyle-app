import { authed } from "@/server/http";
import { discardCapture } from "@/server/modules/capture/service";

export const POST = authed<{ id: string }>(async ({ user, params }) => {
  await discardCapture(user.id, params.id);
  return { ok: true };
});
