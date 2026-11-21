import { z } from "zod";
import { dateKey, domainKey, effort, longText, shortText } from "./common";

// What a capture can become. Every variant maps to exactly one structured
// record type, created only after the user confirms (src/server/modules/capture).
export const CAPTURE_TYPES = ["task", "journal", "goal", "project", "curiosity", "leisure", "memory"] as const;
export type CaptureType = (typeof CAPTURE_TYPES)[number];

export const taskProposal = z.object({
  type: z.literal("task"),
  title: shortText(300),
  dueDate: dateKey.nullable().default(null),
  estimateMinutes: z.number().int().min(1).max(24 * 60).nullable().default(null),
  effort: effort.nullable().default(null),
});

export const journalProposal = z.object({
  type: z.literal("journal"),
  body: shortText(20_000),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).default([]),
});

export const goalProposal = z.object({
  type: z.literal("goal"),
  title: shortText(300),
  domainKey: domainKey.nullable().default(null),
  motivation: longText(2000).nullable().default(null),
});

export const projectProposal = z.object({
  type: z.literal("project"),
  title: shortText(300),
  purpose: longText(2000).nullable().default(null),
  kind: z.enum(["WORK", "PERSONAL", "LEARNING", "CREATIVE", "RECREATION", "HOME"]).default("PERSONAL"),
});

export const curiosityProposal = z.object({
  type: z.literal("curiosity"),
  question: shortText(1000),
  theme: z.string().trim().max(80).nullable().default(null),
});

export const leisureProposal = z.object({
  type: z.literal("leisure"),
  label: shortText(200),
  date: dateKey,
  minutes: z.number().int().min(5).max(24 * 60).nullable().default(null),
});

export const memoryProposal = z.object({
  type: z.literal("memory"),
  content: shortText(2000),
  domainKey: domainKey.nullable().default(null),
});

export const captureProposal = z.discriminatedUnion("type", [
  taskProposal,
  journalProposal,
  goalProposal,
  projectProposal,
  curiosityProposal,
  leisureProposal,
  memoryProposal,
]);
export type CaptureProposal = z.infer<typeof captureProposal>;

export const classification = z.object({
  proposal: captureProposal,
  confidence: z.number().min(0).max(1),
  rationale: z.string().max(500),
  // Other plausible destinations, shown when confidence is low.
  alternatives: z.array(z.enum(CAPTURE_TYPES)).max(3),
});
export type Classification = z.infer<typeof classification>;

/** Below this, the UI asks the user to pick the destination explicitly. */
export const LOW_CONFIDENCE = 0.6;

export const createCaptureInput = z.object({ text: shortText(5000) });

export const confirmCaptureInput = z.object({
  // The user may edit the proposal (or switch its type) before confirming.
  proposal: captureProposal,
});

// Flat shape used for LLM structured output: every field present and
// nullable, which is far more robust for constrained decoding than a union.
export const aiClassificationOutput = z.object({
  type: z.enum(CAPTURE_TYPES),
  title: z.string().nullable().describe("Short title for task/goal/project/leisure, null otherwise"),
  body: z.string().nullable().describe("Full text for journal or memory, null otherwise"),
  question: z.string().nullable().describe("The question, for curiosity, null otherwise"),
  dueDate: z.string().nullable().describe("YYYY-MM-DD if the text states or clearly implies a date"),
  minutes: z.number().nullable().describe("Duration in minutes if stated"),
  domainKey: domainKey.nullable(),
  projectKind: z.enum(["WORK", "PERSONAL", "LEARNING", "CREATIVE", "RECREATION", "HOME"]).nullable(),
  confidence: z.number().describe("0..1, how sure you are of the type"),
  rationale: z.string().describe("One short sentence"),
  alternatives: z.array(z.enum(CAPTURE_TYPES)),
});
export type AiClassificationOutput = z.infer<typeof aiClassificationOutput>;
