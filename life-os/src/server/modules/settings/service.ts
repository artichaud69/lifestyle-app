import type { AiScope, Prisma } from "@prisma/client";
import { AI_SCOPES, type AiScopeKey, type settingsUpdate } from "@/lib/schemas/account";
import type { z } from "zod";
import { db } from "../../db";
import { audit } from "../../audit";
import { getAiProvider } from "../../ai";

// Private by default for the journal: the AI may only read it once the user
// switches the scope on. Planning/goals/profile are on so the advisor is useful
// out of the box — but nothing leaves the server without EXTERNAL_AI_PROCESSING
// consent, which is off by default.
export const DEFAULT_SCOPES: Record<AiScopeKey, boolean> = {
  PROFILE: true,
  GOALS: true,
  PLANNING: true,
  MEMORY: true,
  JOURNAL: false,
};

export async function getSettings(userId: string) {
  const [settings, perms, consent] = await Promise.all([
    db.userSettings.findUniqueOrThrow({ where: { userId } }),
    db.aiDomainPermission.findMany({ where: { userId } }),
    hasExternalAiConsent(userId),
  ]);
  const scopes = { ...DEFAULT_SCOPES };
  for (const p of perms) scopes[p.scope] = p.allowed;
  return { ...settings, aiScopes: scopes, externalAiConsent: consent };
}

export async function hasExternalAiConsent(userId: string) {
  const latest = await db.userConsent.findFirst({
    where: { userId, kind: "EXTERNAL_AI_PROCESSING" },
    orderBy: { createdAt: "desc" },
  });
  return latest?.granted ?? false;
}

export async function setExternalAiConsent(userId: string, granted: boolean, tx: Prisma.TransactionClient = db) {
  await tx.userConsent.create({ data: { userId, kind: "EXTERNAL_AI_PROCESSING", granted } });
}

export async function setScopes(userId: string, scopes: Partial<Record<AiScopeKey, boolean>>, tx: Prisma.TransactionClient = db) {
  for (const scope of AI_SCOPES) {
    const allowed = scopes[scope];
    if (allowed === undefined) continue;
    await tx.aiDomainPermission.upsert({
      where: { userId_scope: { userId, scope: scope as AiScope } },
      create: { userId, scope: scope as AiScope, allowed },
      update: { allowed },
    });
  }
}

/**
 * What the AI layer may do for this user right now. `external` is true only
 * when a provider is configured AND the user consented to external processing.
 */
export async function getAiAccess(userId: string) {
  const s = await getSettings(userId);
  const provider = getAiProvider();
  return {
    provider: s.externalAiConsent ? provider : null,
    providerConfigured: provider !== null,
    consent: s.externalAiConsent,
    scopes: s.aiScopes,
    mode: s.advisorMode,
    timezone: s.timezone,
  };
}

export async function updateSettings(userId: string, input: z.infer<typeof settingsUpdate>) {
  const { displayName, externalAiConsent, aiScopes, recoveryMode, ...rest } = input;
  await db.$transaction(async (tx) => {
    if (displayName) await tx.user.update({ where: { id: userId }, data: { displayName } });
    const data: Prisma.UserSettingsUpdateInput = { ...rest };
    if (recoveryMode !== undefined) {
      data.recoveryMode = recoveryMode;
      data.recoveryModeSince = recoveryMode ? new Date() : null;
    }
    await tx.userSettings.update({ where: { userId }, data });
    if (aiScopes) await setScopes(userId, aiScopes, tx);
    if (externalAiConsent !== undefined) await setExternalAiConsent(userId, externalAiConsent, tx);
  });
  if (externalAiConsent !== undefined) await audit(userId, externalAiConsent ? "consent.ai.grant" : "consent.ai.revoke");
  if (aiScopes) await audit(userId, "settings.ai_scopes", undefined, aiScopes);
  return getSettings(userId);
}
