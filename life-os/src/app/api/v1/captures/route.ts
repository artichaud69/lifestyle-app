import { createCaptureInput } from "@/lib/schemas/capture";
import { authed, readJson } from "@/server/http";
import { createCapture, listPendingCaptures } from "@/server/modules/capture/service";

export const GET = authed(async ({ user }) => ({ captures: await listPendingCaptures(user.id) }));

// Captures may call the AI provider, so they get a tighter limit.
export const POST = authed(
  async ({ req, user }) => {
    const { text } = await readJson(req, createCaptureInput);
    return { capture: await createCapture(user.id, text) };
  },
  { limit: 60 },
);
