import { signup, completeOnboarding } from "@/server/modules/account/service";
import type { AiProvider } from "@/server/ai";
import type { AiClassificationOutput } from "@/lib/schemas/capture";

let n = 0;
export async function makeUser(opts: { consent?: boolean; scopes?: string[] } = {}) {
  n += 1;
  const user = await signup({ email: `user${n}-${Date.now()}@example.test`, password: "correct horse battery", displayName: `User ${n}` });
  await completeOnboarding(user.id, {
    displayName: `User ${n}`,
    usageReasons: ["Plan my week"],
    activeDomains: ["health", "relationships", "achievement", "recreation"],
    priorities: ["Recover from a stressful quarter"],
    interfaceMode: "STANDARD",
    externalAiConsent: opts.consent ?? false,
    aiScopes: (opts.scopes ?? ["PROFILE", "GOALS", "PLANNING", "MEMORY"]) as never,
  });
  return user;
}

/** Records every call, so tests can assert exactly what would reach a model. */
export class FakeProvider implements AiProvider {
  readonly id = "fake:test";
  calls: { classify: string[]; advise: Array<{ system: string; context: string; question: string }> } = { classify: [], advise: [] };
  constructor(
    private classification?: Partial<AiClassificationOutput>,
    private fail = false,
  ) {}
  async classify(req: { text: string }) {
    this.calls.classify.push(req.text);
    if (this.fail) throw new Error("boom");
    return {
      type: "task",
      title: req.text,
      body: null,
      question: null,
      dueDate: null,
      minutes: null,
      domainKey: null,
      projectKind: null,
      confidence: 0.9,
      rationale: "fake",
      alternatives: [],
      ...this.classification,
    } as AiClassificationOutput;
  }
  async advise(req: { system: string; context: string; question: string }) {
    this.calls.advise.push(req);
    if (this.fail) throw new Error("boom");
    return "Fake advice.";
  }
}
