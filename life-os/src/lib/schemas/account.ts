import { z } from "zod";
import { domainKey, shortText } from "./common";

export const signupInput = z.object({
  email: z.email().max(254).transform((e) => e.toLowerCase()),
  password: z.string().min(12, "Use at least 12 characters").max(200),
  displayName: shortText(60),
});

export const loginInput = z.object({
  email: z.email().max(254).transform((e) => e.toLowerCase()),
  password: z.string().min(1).max(200),
});

export const AI_SCOPES = ["PROFILE", "GOALS", "PLANNING", "JOURNAL", "MEMORY"] as const;
export const aiScope = z.enum(AI_SCOPES);
export type AiScopeKey = z.infer<typeof aiScope>;

export const ADVISOR_MODES = ["STRATEGIST", "ANALYST", "COACH", "PLANNER", "EXPLORER", "REFLECTOR"] as const;

export const onboardingInput = z.object({
  displayName: shortText(60),
  usageReasons: z.array(z.string().trim().min(1).max(200)).max(8),
  activeDomains: z.array(domainKey).min(1),
  priorities: z.array(z.string().trim().min(1).max(300)).max(5),
  interfaceMode: z.enum(["MINIMAL", "STANDARD", "ANALYTICAL"]),
  externalAiConsent: z.boolean(),
  aiScopes: z.array(aiScope),
});

export const settingsUpdate = z.object({
  displayName: shortText(60).optional(),
  interfaceMode: z.enum(["MINIMAL", "STANDARD", "ANALYTICAL"]).optional(),
  theme: z.enum(["SYSTEM", "LIGHT", "DARK"]).optional(),
  timezone: z
    .string()
    .max(64)
    .refine((tz) => {
      try {
        new Intl.DateTimeFormat("en", { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "Unknown timezone")
    .optional(),
  weekStartsOn: z.number().int().min(0).max(6).optional(),
  recoveryMode: z.boolean().optional(),
  quietMode: z.boolean().optional(),
  proactiveInsights: z.boolean().optional(),
  advisorMode: z.enum(ADVISOR_MODES).optional(),
  externalAiConsent: z.boolean().optional(),
  aiScopes: z.record(aiScope, z.boolean()).optional(),
});

export const deleteAccountInput = z.object({ password: z.string().min(1).max(200), confirm: z.literal("DELETE") });
