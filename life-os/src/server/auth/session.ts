import { createHash, randomBytes } from "node:crypto";
import { db } from "../db";

export const SESSION_COOKIE = "lifeos_session";
const SESSION_DAYS = 30;
// Refresh lastSeenAt / extend expiry at most this often, to avoid a write per request.
const TOUCH_INTERVAL_MS = 15 * 60 * 1000;

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string, userAgent: string | null) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const session = await db.session.create({
    data: { userId, tokenHash: hashToken(token), userAgent: userAgent?.slice(0, 300) ?? null, expiresAt },
  });
  return { token, session };
}

export type SessionUser = { id: string; email: string; displayName: string; onboardedAt: Date | null; sessionId: string };

export async function validateSessionToken(token: string | undefined | null): Promise<SessionUser | null> {
  if (!token || token.length > 200) return null;
  const session = await db.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { select: { id: true, email: true, displayName: true, onboardedAt: true } } },
  });
  if (!session || session.revokedAt || session.expiresAt.getTime() < Date.now()) return null;

  if (Date.now() - session.lastSeenAt.getTime() > TOUCH_INTERVAL_MS) {
    await db.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date(), expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) },
    });
  }
  return { ...session.user, sessionId: session.id };
}

export async function revokeSession(userId: string, sessionId: string) {
  // updateMany with userId: a user can only revoke their own sessions.
  const res = await db.session.updateMany({
    where: { id: sessionId, userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return res.count > 0;
}

export async function revokeAllSessions(userId: string, exceptSessionId?: string) {
  await db.session.updateMany({
    where: { userId, revokedAt: null, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    data: { revokedAt: new Date() },
  });
}

export async function listSessions(userId: string) {
  return db.session.findMany({
    where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, userAgent: true, createdAt: true, lastSeenAt: true },
    orderBy: { lastSeenAt: "desc" },
  });
}

export const sessionCookieOptions = () => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.COOKIE_SECURE === "true",
  path: "/",
  maxAge: SESSION_DAYS * 86_400,
});
