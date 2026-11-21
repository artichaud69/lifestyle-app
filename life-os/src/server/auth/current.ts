import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { SESSION_COOKIE, validateSessionToken, type SessionUser } from "./session";

// Per-request memoised lookup of the signed-in user (server components).
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const store = await cookies();
  return validateSessionToken(store.get(SESSION_COOKIE)?.value);
});

/** For pages: redirects to /login (or onboarding) instead of throwing. */
export async function requirePageUser(opts: { allowUnonboarded?: boolean } = {}): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.onboardedAt && !opts.allowUnonboarded) redirect("/onboarding");
  return user;
}
