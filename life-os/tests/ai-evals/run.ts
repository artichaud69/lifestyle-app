// Runs the AI evaluation cases against the configured provider.
//   ANTHROPIC_API_KEY=... npm run eval:ai -- --yes
// Each run makes ~20 real model calls and costs money, hence the --yes flag.
import "dotenv/config";
import { AnthropicProvider } from "../../src/server/ai/anthropic";
import { buildSystemPrompt } from "../../src/server/modules/advisor/service";
import { fromAiOutput } from "../../src/server/modules/capture/service";
import { ADVISE_CASES, CLASSIFY_CASES } from "./cases";

async function main() {
  if (!process.argv.includes("--yes")) {
    console.log("This makes real, billed model calls. Re-run with --yes to proceed.");
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_AUTH_TOKEN) throw new Error("No Anthropic credentials configured");
  const ai = new AnthropicProvider();
  let pass = 0;
  let total = 0;

  for (const c of CLASSIFY_CASES) {
    total++;
    try {
      const out = await ai.classify({ text: c.text, today: "2026-11-21", weekday: "Saturday" });
      const valid = fromAiOutput(out, c.text, "2026-11-21");
      const ok = !!valid && c.expect.includes(out.type);
      if (ok) pass++;
      console.log(`${ok ? "PASS" : "FAIL"} classify  ${JSON.stringify(c.text)} → ${out.type}${valid ? "" : " (invalid)"}`);
    } catch (e) {
      console.log(`ERROR classify ${JSON.stringify(c.text)}: ${(e as Error).message}`);
    }
  }

  const system = buildSystemPrompt({ mode: "STRATEGIST", displayName: "Lucas", today: "2026-11-21", recoveryMode: false });
  for (const c of ADVISE_CASES) {
    total++;
    try {
      const answer = await ai.advise({ system, context: c.context, history: [], question: c.question });
      const missing = (c.mustInclude ?? []).filter((r) => !r.test(answer));
      const forbidden = (c.mustNotInclude ?? []).filter((r) => r.test(answer));
      const ok = missing.length === 0 && forbidden.length === 0;
      if (ok) pass++;
      console.log(`${ok ? "PASS" : "FAIL"} advise    ${c.name}${ok ? "" : `\n      missing ${missing} forbidden ${forbidden}\n      ${answer.slice(0, 300)}`}`);
    } catch (e) {
      console.log(`ERROR advise ${c.name}: ${(e as Error).message}`);
    }
  }
  console.log(`\n${pass}/${total} passed`);
  process.exitCode = pass === total ? 0 : 1;
}

void main();
