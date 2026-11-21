import { z } from "zod";
import { isDateKey } from "../dates";

export const dateKey = z.string().refine(isDateKey, "Expected a date as YYYY-MM-DD");
export const id = z.string().min(1).max(64);
export const shortText = (max = 200) => z.string().trim().min(1, "Required").max(max);
export const longText = (max = 20_000) => z.string().trim().max(max);

export const DOMAIN_KEYS = [
  "achievement",
  "health",
  "relationships",
  "learning",
  "autonomy",
  "recreation",
  "finance",
  "identity",
] as const;
export const domainKey = z.enum(DOMAIN_KEYS);
export type DomainKey = z.infer<typeof domainKey>;

export const effort = z.enum(["LOW", "MODERATE", "HIGH"]);
export const energy = z.enum(["LOW", "MODERATE", "HIGH"]);
