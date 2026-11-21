import { z } from "zod";
import { id, shortText } from "./common";
import { ADVISOR_MODES } from "./account";

export const askInput = z.object({
  conversationId: id.nullable().optional(),
  message: shortText(8000),
  mode: z.enum(ADVISOR_MODES).optional(),
});

export const contextRef = z.object({
  kind: z.enum(["memory", "journal", "task", "goal", "project", "curiosity", "value", "plan"]),
  id: z.string(),
  label: z.string(),
  score: z.number().optional(),
  status: z.string().optional(),
});
export type ContextRef = z.infer<typeof contextRef>;
