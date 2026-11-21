import { NextResponse, type NextRequest } from "next/server";
import { AppError } from "@/lib/errors";
import { signupInput } from "@/lib/schemas/account";
import { checkOrigin, clientIp, errorResponse, readJson } from "@/server/http";
import { rateLimit } from "@/server/security/rateLimit";
import { signup } from "@/server/modules/account/service";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    if (!rateLimit(`signup:${clientIp(req)}`, 10, 60 * 60_000).ok) throw new AppError("RATE_LIMITED", "Too many sign-ups from here");
    const input = await readJson(req, signupInput);
    const user = await signup(input);
    const { token } = await createSession(user.id, req.headers.get("user-agent"));
    const res = NextResponse.json({ ok: true, next: "/onboarding" });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
