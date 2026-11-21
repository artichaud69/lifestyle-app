import { describe, expect, it } from "vitest";
import { classifyWithRules } from "@/server/modules/capture/rulesClassifier";
import { LOW_CONFIDENCE, captureProposal } from "@/lib/schemas/capture";

const today = "2026-11-21"; // a Saturday

describe("rules classifier — the examples from the spec", () => {
  const cases: Array<[string, string, Record<string, unknown>?]> = [
    ["Remind me to call the dentist next week.", "task", { title: "Call the dentist", dueDate: "2026-11-23" }],
    ["I had a really good run today.", "journal"],
    ["I want to learn Python properly.", "project", { kind: "LEARNING" }],
    ["I feel frustrated because I wasted my afternoon.", "journal"],
    ["I am considering changing careers.", "journal", { tags: ["considering"] }],
    ["Tonight I want to play Minecraft for two hours.", "leisure", { date: today, minutes: 120 }],
    ["How did Roman logistics work?", "curiosity"],
    ["How does reinforcement learning work?", "curiosity"],
    ["Could I build my own finance forecasting engine?", "curiosity"],
    ["I would love to build a tool to analyze my running performance.", "project"],
    ["I want to run 10 km comfortably", "goal", { domainKey: "health" }],
    ["Buy a birthday present for Emma tomorrow", "task", { dueDate: "2026-11-22" }],
    ["I value autonomy more than status", "memory"],
    ["I work best in the morning", "memory"],
  ];
  it.each(cases)("%s → %s", (text, type, fields) => {
    const r = classifyWithRules(text, today);
    expect(r.proposal.type).toBe(type);
    if (fields) expect(r.proposal).toMatchObject(fields);
    // Whatever it returns must be a valid proposal.
    expect(captureProposal.safeParse(r.proposal).success).toBe(true);
  });

  it("is honest when unsure: low confidence and alternatives", () => {
    const r = classifyWithRules("the blue one", today);
    expect(r.confidence).toBeLessThan(LOW_CONFIDENCE);
    expect(r.alternatives.length).toBeGreaterThan(0);
    expect(r.proposal).toMatchObject({ type: "journal", body: "the blue one" });
  });

  it("never treats leisure as a task", () => {
    for (const t of ["I'm going to watch a movie tonight", "This weekend I want to paint miniatures"]) {
      expect(classifyWithRules(t, today).proposal.type).toBe("leisure");
    }
  });

  it("does not offer the chosen type as an alternative", () => {
    const r = classifyWithRules("Call mum", today);
    expect(r.alternatives).not.toContain(r.proposal.type);
  });
});
