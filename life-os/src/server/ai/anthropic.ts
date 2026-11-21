import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { aiClassificationOutput } from "@/lib/schemas/capture";
import { CLASSIFY_SYSTEM } from "./prompts";
import { AiUnavailableError, type AdviseRequest, type AiProvider, type ClassifyRequest } from "./types";

// Server-side fallback: if the primary model declines a request, the API
// re-runs it on a fallback model in the same call ("default" routing).
const FALLBACK_BETA = "server-side-fallback-2026-07-01";

export class AnthropicProvider implements AiProvider {
  readonly id: string;
  private client: Anthropic;

  constructor(private model: string = process.env.AI_MODEL || "claude-opus-5-5") {
    this.id = `anthropic:${model}`;
    // Credentials come from the server environment only; never the client.
    this.client = new Anthropic({ timeout: 60_000, maxRetries: 2 });
  }

  async classify(req: ClassifyRequest) {
    try {
      const res = await this.client.beta.messages.parse({
        model: this.model,
        max_tokens: 2000,
        betas: [FALLBACK_BETA],
        fallbacks: "default",
        output_config: { effort: "low", format: betaZodOutputFormat(aiClassificationOutput) },
        system: [{ type: "text", text: CLASSIFY_SYSTEM, cache_control: { type: "ephemeral" } }],
        messages: [
          {
            role: "user",
            content: `Today is ${req.weekday} ${req.today}.\n<note>\n${req.text}\n</note>`,
          },
        ],
      });
      if (res.stop_reason === "refusal") throw new AiUnavailableError("The model declined to classify this note");
      if (!res.parsed_output) throw new AiUnavailableError("The model returned an unparseable classification");
      return res.parsed_output;
    } catch (err) {
      throw wrap(err);
    }
  }

  async advise(req: AdviseRequest) {
    try {
      const res = await this.client.beta.messages.create({
        model: this.model,
        max_tokens: 8000,
        betas: [FALLBACK_BETA],
        fallbacks: "default",
        output_config: { effort: "medium" },
        system: [{ type: "text", text: req.system, cache_control: { type: "ephemeral" } }],
        messages: [
          ...req.history.map((t) => ({ role: t.role, content: t.content })),
          {
            role: "user" as const,
            content: `<personal_context>\n${req.context}\n</personal_context>\n\n${req.question}`,
          },
        ],
      });
      if (res.stop_reason === "refusal") {
        return "I can't help with that request. If something is weighing on you, consider talking it through with someone you trust or a professional.";
      }
      const text = res.content.flatMap((b) => (b.type === "text" ? [b.text] : [])).join("\n").trim();
      if (!text) throw new AiUnavailableError("The model returned an empty answer");
      return text;
    } catch (err) {
      throw wrap(err);
    }
  }
}

function wrap(err: unknown) {
  if (err instanceof AiUnavailableError) return err;
  if (err instanceof Anthropic.AuthenticationError) return new AiUnavailableError("AI provider rejected the API key", err);
  if (err instanceof Anthropic.RateLimitError) return new AiUnavailableError("AI provider is rate limiting; try again shortly", err);
  if (err instanceof Anthropic.APIError) return new AiUnavailableError(`AI provider error (${err.status ?? "network"})`, err);
  return new AiUnavailableError("AI provider unavailable", err);
}
