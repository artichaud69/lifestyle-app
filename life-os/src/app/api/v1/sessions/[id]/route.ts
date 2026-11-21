import { notFound } from "@/lib/errors";
import { authed } from "@/server/http";
import { revokeSession } from "@/server/auth/session";
import { audit } from "@/server/audit";

export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  if (!(await revokeSession(user.id, params.id))) throw notFound("Session");
  await audit(user.id, "auth.revoke_session", { type: "Session", id: params.id });
  return { ok: true };
});
