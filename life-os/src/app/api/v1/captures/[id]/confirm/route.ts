import { confirmCaptureInput } from "@/lib/schemas/capture";
import { authed, readJson } from "@/server/http";
import { confirmCapture } from "@/server/modules/capture/service";

export const POST = authed<{ id: string }>(async ({ req, user, params }) => {
  const { proposal } = await readJson(req, confirmCaptureInput);
  return confirmCapture(user.id, params.id, proposal);
});
