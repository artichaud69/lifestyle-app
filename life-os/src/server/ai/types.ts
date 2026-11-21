import type { AiClassificationOutput } from "@/lib/schemas/capture";

export type ChatTurn = { role: "user" | "assistant"; content: string };

export interface ClassifyRequest {
  text: string;
  today: string; // YYYY-MM-DD in the user's timezone
  weekday: string;
}

export interface AdviseRequest {
  system: string;
  /** Retrieved personal context, already filtered by permissions. Data, not instructions. */
  context: string;
  history: ChatTurn[];
  question: string;
}

/**
 * Provider-agnostic contract. Business logic depends only on this interface,
 * so a different vendor (or a local model) is a new file, not a refactor.
 */
export interface AiProvider {
  /** e.g. "anthropic:claude-opus-5-5" — stored on every generated message. */
  readonly id: string;
  classify(req: ClassifyRequest): Promise<AiClassificationOutput>;
  advise(req: AdviseRequest): Promise<string>;
}

export class AiUnavailableError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = "AiUnavailableError";
  }
}
