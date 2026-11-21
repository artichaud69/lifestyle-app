import { NextResponse, type NextRequest } from "next/server";
import { AppError } from "@/lib/errors";
import { loginInput } from "@/lib/schemas/account";
import { checkOrigin, clientIp, errorResponse, readJson } from "@/server/http";
import { rateLimit } from "@/server/security/rateLimit";
import { authenticate } from "@/server/modules/account/service";
import { createSession, SESSION_COOKIE, sessionCookieOptions } from "@/server/auth/session";

export async function POST(req: NextRequest) {
  try {
    checkOrigin(req);
    const input = await readJson(req, loginInput);
    // Limit per IP and per account, to slow both spraying and targeted guessing.
    const byIp = rateLimit(`login:ip:${clientIp(req)}`, 20, 15 * 60_000);
    const byAccount = rateLimit(`login:acct:${input.email}`, 8, 15 * 60_000);
    if (!byIp.ok || !byAccount.ok) throw new AppError("RATE_LIMITED", "Too many attempts. Try again in a few minutes.");
    const user = await authenticate(input.email, input.password);
    const { token } = await createSession(user.id, req.headers.get("user-agent"));
    const res = NextResponse.json({ ok: true, next: user.onboardedAt ? "/" : "/onboarding" });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return res;
  } catch (err) {
    return errorResponse(err);
  }
}
