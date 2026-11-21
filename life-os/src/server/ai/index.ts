import { AnthropicProvider } from "./anthropic";
import type { AiProvider } from "./types";

let override: AiProvider | null | undefined;
let cached: AiProvider | null | undefined;

/**
 * The configured provider, or null when AI is switched off / unconfigured.
 * Callers must treat null as a normal state: core features work without AI.
 */
export function getAiProvider(): AiProvider | null {
  if (override !== undefined) return override;
  if (cached !== undefined) return cached;
  const kind = (process.env.AI_PROVIDER || "anthropic").toLowerCase();
  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  cached = kind === "anthropic" && hasKey ? new AnthropicProvider() : null;
  return cached;
}

/** Tests inject a fake provider; pass undefined to restore the real one. */
export function setAiProviderForTests(provider: AiProvider | null | undefined) {
  override = provider;
}

export * from "./types";
