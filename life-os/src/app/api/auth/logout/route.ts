import { NextResponse, type NextRequest } from "next/server";
import { checkOrigin, errorResponse } from "@/server/http";
import { revokeSession, SESSION_COOKIE, validateSessionToken } from "@/server/auth/session";
import { audit } from "@/server/audit";

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const user = await validateSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
    if (user) {
      await revokeSession(user.id, user.sessionId);
      await audit(user.id, "auth.logout");
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
