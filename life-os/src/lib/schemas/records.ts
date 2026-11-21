import { z } from "zod";
import { dateKey, domainKey, effort, energy, id, longText, shortText } from "./common";

const optionalDate = dateKey.nullable().optional();

export const taskCreate = z.object({
  title: shortText(300),
  notes: longText(5000).nullable().optional(),
  dueDate: optionalDate,
  scheduledFor: optionalDate,
  priority: z.number().int().min(1).max(3).optional(),
  estimateMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  effort: effort.nullable().optional(),
  projectId: id.nullable().optional(),
  goalId: id.nullable().optional(),
});
export const taskUpdate = taskCreate.partial().extend({
  status: z.enum(["TODO", "DONE", "CANCELLED"]).optional(),
});

export const goalCreate = z.object({
  title: shortText(300),
  description: longText(5000).nullable().optional(),
  motivation: longText(2000).nullable().optional(),
  domainKey: domainKey.nullable().optional(),
  horizon: z.enum(["TEN_YEARS", "FIVE_YEARS", "ONE_YEAR", "QUARTER", "MONTH", "OPEN"]).optional(),
  priority: z.number().int().min(1).max(3).optional(),
  targetDate: optionalDate,
  progressMeasure: longText(500).nullable().optional(),
  parentId: id.nullable().optional(),
});
export const goalUpdate = goalCreate.partial().extend({
  status: z.enum(["ACTIVE", "PAUSED", "ACHIEVED", "RELEASED"]).optional(),
});
export const milestoneCreate = z.object({ title: shortText(300), dueDate: optionalDate });
export const milestoneUpdate = z.object({ title: shortText(300).optional(), done: z.boolean().optional() });

export const projectCreate = z.object({
  title: shortText(300),
  purpose: longText(2000).nullable().optional(),
  description: longText(10_000).nullable().optional(),
  kind: z.enum(["WORK", "PERSONAL", "LEARNING", "CREATIVE", "RECREATION", "HOME"]).optional(),
  status: z.enum(["IDEA", "ACTIVE", "PAUSED", "DONE", "DROPPED"]).optional(),
  nextAction: longText(500).nullable().optional(),
  targetDate: optionalDate,
  goalId: id.nullable().optional(),
  domainKey: domainKey.nullable().optional(),
});
export const projectUpdate = projectCreate.partial();

export const journalCreate = z.object({
  body: shortText(20_000),
  title: longText(200).nullable().optional(),
  mood: z.number().int().min(1).max(5).nullable().optional(),
  energy: energy.nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  occurredAt: z.iso.datetime().optional(),
  excludeFromAi: z.boolean().optional(),
});
export const journalUpdate = journalCreate.partial();

export const curiosityUpdate = z.object({
  question: shortText(1000).optional(),
  theme: z.string().trim().max(80).nullable().optional(),
  notes: longText(5000).nullable().optional(),
  status: z.enum(["OPEN", "EXPLORING", "ANSWERED", "PARKED"]).optional(),
});

export const valueCreate = z.object({ name: shortText(80), description: longText(1000).nullable().optional() });
export const valueUpdate = valueCreate.partial();

export const memoryCreate = z.object({
  content: shortText(2000),
  layer: z.enum(["PROFILE", "EPISODIC", "WORKING", "REFLECTIVE"]),
  domainKey: domainKey.nullable().optional(),
  sensitivity: z.enum(["NORMAL", "PERSONAL", "SENSITIVE", "HIGHLY_SENSITIVE"]).optional(),
});
export const memoryUpdate = z.object({
  content: shortText(2000).optional(),
  // Users can confirm an inference, or reject it as inaccurate. They cannot
  // relabel their own statement as an "AI inference" or vice versa.
  verdict: z.enum(["confirm", "reject"]).optional(),
  excludedFromAi: z.boolean().optional(),
  sensitivity: z.enum(["NORMAL", "PERSONAL", "SENSITIVE", "HIGHLY_SENSITIVE"]).optional(),
});

export const planUpdate = z.object({
  intention: longText(500).nullable().optional(),
  energy: energy.nullable().optional(),
  notes: longText(5000).nullable().optional(),
});
export const planItemCreate = z.object({
  kind: z.enum(["MAIN", "OPTIONAL", "COMMITMENT", "LEISURE", "RECOVERY"]),
  label: shortText(200).optional(),
  taskId: id.nullable().optional(),
  minutes: z.number().int().min(5).max(1440).nullable().optional(),
});
export const planItemUpdate = z.object({
  label: shortText(200).optional(),
  minutes: z.number().int().min(5).max(1440).nullable().optional(),
  done: z.boolean().optional(),
  aligned: z.boolean().nullable().optional(),
});

export const domainUpdate = z.object({
  name: shortText(60).optional(),
  description: longText(500).nullable().optional(),
  isActive: z.boolean().optional(),
  status: z.enum(["UNSET", "THRIVING", "STEADY", "NEEDS_ATTENTION", "RESTING"]).optional(),
  statusNote: longText(300).nullable().optional(),
});
