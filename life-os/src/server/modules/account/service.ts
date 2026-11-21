import type { z } from "zod";
import { AppError } from "@/lib/errors";
import type { onboardingInput, signupInput } from "@/lib/schemas/account";
import { DOMAIN_KEYS, type DomainKey } from "@/lib/schemas/common";
import { db } from "../../db";
import { audit } from "../../audit";
import { DUMMY_HASH, hashPassword, verifyPassword } from "../../auth/password";
import { DEFAULT_SCOPES, setExternalAiConsent, setScopes } from "../settings/service";

// The eight dimensions of a good life from the product philosophy. They are
// deliberately not collapsed into one score; users can rename or hide them.
export const DEFAULT_DOMAINS: Record<DomainKey, { name: string; description: string }> = {
  achievement: { name: "Achievement & progress", description: "Meaningful work, ambitious projects, mastery." },
  health: { name: "Health & energy", description: "Physical and mental well-being, sleep, training, recovery." },
  relationships: { name: "Relationships & family", description: "Partner, children, family and friends." },
  learning: { name: "Curiosity & learning", description: "Intellectual curiosity, study, new skills." },
  autonomy: { name: "Autonomy & freedom", description: "Control over time, choices and direction." },
  recreation: { name: "Enjoyment & play", description: "Games, hobbies, creative play, rest." },
  finance: { name: "Financial security", description: "Stability, savings, room to choose." },
  identity: { name: "Identity & fulfilment", description: "Values, meaning, who you are becoming." },
};

export async function signup(input: z.infer<typeof signupInput>) {
  const existing = await db.user.findUnique({ where: { email: input.email } });
  if (existing) throw new AppError("CONFLICT", "An account with this email already exists");
  const passwordHash = await hashPassword(input.password);
  const user = await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: input.email, passwordHash, displayName: input.displayName, settings: { create: {} } },
    });
    await tx.lifeDomain.createMany({
      data: DOMAIN_KEYS.map((key, i) => ({ userId: user.id, key, sortOrder: i, ...DEFAULT_DOMAINS[key] })),
    });
    await setScopes(user.id, DEFAULT_SCOPES, tx);
    await setExternalAiConsent(user.id, false, tx);
    return user;
  });
  await audit(user.id, "auth.signup");
  return user;
}

export async function authenticate(email: string, password: string) {
  const user = await db.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) {
    await audit(user?.id ?? null, "auth.login_failed");
    throw new AppError("UNAUTHENTICATED", "Email or password is incorrect");
  }
  await audit(user.id, "auth.login");
  return user;
}

export async function completeOnboarding(userId: string, input: z.infer<typeof onboardingInput>) {
  await db.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { displayName: input.displayName, onboardedAt: new Date() } });
    await tx.userSettings.update({
      where: { userId },
      data: { usageReasons: input.usageReasons, interfaceMode: input.interfaceMode },
    });
    await tx.lifeDomain.updateMany({ where: { userId }, data: { isActive: false } });
    await tx.lifeDomain.updateMany({ where: { userId, key: { in: input.activeDomains } }, data: { isActive: true } });
    // Current priorities are working memory the user stated themselves.
    for (const p of input.priorities) {
      await tx.memory.create({
        data: {
          userId,
          layer: "WORKING",
          status: "USER_STATED",
          content: `Current priority: ${p}`,
          sensitivity: "PERSONAL",
          sources: { create: { sourceType: "USER", excerpt: "Onboarding" } },
        },
      });
    }
    const scopes = Object.fromEntries(
      Object.keys(DEFAULT_SCOPES).map((k) => [k, input.aiScopes.includes(k as never)]),
    );
    await setScopes(userId, scopes, tx);
    await setExternalAiConsent(userId, input.externalAiConsent, tx);
  });
  await audit(userId, "onboarding.complete");
}

export async function changePassword(userId: string, current: string, next: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(current, user.passwordHash))) throw new AppError("FORBIDDEN", "Current password is incorrect");
  await db.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(next) } });
  await audit(userId, "auth.password_change");
}

/** Hard-deletes the account and, via cascades, every record it owns. */
export async function deleteAccount(userId: string, password: string) {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(password, user.passwordHash))) throw new AppError("FORBIDDEN", "Password is incorrect");
  await db.user.delete({ where: { id: userId } });
  // AuditLog.userId is SET NULL on delete; record the event without identity.
  await audit(null, "account.deleted");
}
