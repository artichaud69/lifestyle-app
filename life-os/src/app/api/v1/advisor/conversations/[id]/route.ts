import { authed } from "@/server/http";
import { deleteConversation, getConversation } from "@/server/modules/advisor/service";

export const GET = authed<{ id: string }>(async ({ user, params }) => ({ conversation: await getConversation(user.id, params.id) }));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await deleteConversation(user.id, params.id);
  return { ok: true };
});
