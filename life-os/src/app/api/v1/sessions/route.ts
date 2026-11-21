import { authed } from "@/server/http";
import { listSessions, revokeAllSessions } from "@/server/auth/session";
import { audit } from "@/server/audit";

export const GET = authed(async ({ user }) => ({
  sessions: (await listSessions(user.id)).map((s) => ({ ...s, current: s.id === user.sessionId })),
}));
// Sign out everywhere else.
export const DELETE = authed(async ({ user }) => {
  await revokeAllSessions(user.id, user.sessionId);
  await audit(user.id, "auth.revoke_other_sessions");
  return { ok: true };
});
