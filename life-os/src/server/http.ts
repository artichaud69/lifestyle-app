import { NextResponse, type NextRequest } from "next/server";
import { z, type ZodType } from "zod";
import { AppError } from "@/lib/errors";
import { rateLimit } from "./security/rateLimit";
import { SESSION_COOKIE, validateSessionToken, type SessionUser } from "./auth/session";

export type RouteCtx<P> = { params: Promise<P> };

type Handler<P> = (args: { req: NextRequest; user: SessionUser; params: P }) => Promise<unknown>;

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * CSRF defence for cookie-authenticated JSON APIs: SameSite=Lax cookies plus
 * an Origin check and a JSON content type on every mutating request.
 */
export function checkOrigin(req: NextRequest) {
  if (!MUTATING.has(req.method)) return;
  const origin = req.headers.get("origin");
  const allowed = new Set([req.nextUrl.origin, process.env.APP_ORIGIN].filter(Boolean));
  if (origin && !allowed.has(origin)) throw new AppError("FORBIDDEN", "Cross-origin request refused");
  if (req.method !== "DELETE") {
    const ct = req.headers.get("content-type") ?? "";
    if (!ct.startsWith("application/json")) throw new AppError("VALIDATION", "Expected application/json");
  }
}

export async function readJson<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AppError("VALIDATION", "Invalid JSON body");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new AppError("VALIDATION", "Invalid input", z.flattenError(parsed.error));
  return parsed.data;
}

export function errorResponse(err: unknown) {
  if (err instanceof AppError) {
    return NextResponse.json({ error: { code: err.code, message: err.message, details: err.details } }, { status: err.status });
  }
  console.error(err);
  return NextResponse.json({ error: { code: "INTERNAL", message: "Something went wrong" } }, { status: 500 });
}

/** Authenticated JSON route: auth → origin check → rate limit → handler → JSON. */
export function authed<P = Record<string, never>>(handler: Handler<P>, opts: { limit?: number } = {}) {
  return async (req: NextRequest, ctx: RouteCtx<P>) => {
    try {
      checkOrigin(req);
      const user = await validateSessionToken(req.cookies.get(SESSION_COOKIE)?.value);
      if (!user) throw new AppError("UNAUTHENTICATED", "Sign in required");
      const rl = rateLimit(`u:${user.id}:${MUTATING.has(req.method) ? "w" : "r"}`, opts.limit ?? 300, 60_000);
      if (!rl.ok) throw new AppError("RATE_LIMITED", "Too many requests, slow down a little");
      const params = (await ctx.params) ?? ({} as P);
      const result = await handler({ req, user, params });
      if (result instanceof Response) return result;
      return NextResponse.json(result ?? { ok: true });
    } catch (err) {
      return errorResponse(err);
    }
  };
}

export function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}
