import { describe, expect, it } from "vitest";
import { fromAiOutput } from "@/server/modules/capture/service";
import { buildSystemPrompt, offlineAnswer } from "@/server/modules/advisor/service";
import type { AiClassificationOutput } from "@/lib/schemas/capture";

const out = (o: Partial<AiClassificationOutput>): AiClassificationOutput => ({
  type: "task",
  title: null,
  body: null,
  question: null,
  dueDate: null,
  minutes: null,
  domainKey: null,
  projectKind: null,
  confidence: 0.9,
  rationale: "r",
  alternatives: [],
  ...o,
});

describe("structured-output validation", () => {
  it("maps a valid AI output to a proposal", () => {
    const r = fromAiOutput(out({ type: "leisure", title: "Minecraft", dueDate: "2026-11-21", minutes: 120 }), "raw", "2026-11-21");
    expect(r?.proposal).toEqual({ type: "leisure", label: "Minecraft", date: "2026-11-21", minutes: 120 });
  });
  it("keeps the user's own words when the model omits them", () => {
    const r = fromAiOutput(out({ type: "journal" }), "I had a great day", "2026-11-21");
    expect(r?.proposal).toMatchObject({ type: "journal", body: "I had a great day" });
  });
  it("rejects invalid dates instead of storing them", () => {
    expect(fromAiOutput(out({ type: "task", title: "x", dueDate: "next tuesday" }), "x", "2026-11-21")).toBeNull();
  });
  it("clamps confidence and drops the chosen type from alternatives", () => {
    const r = fromAiOutput(out({ confidence: 7, alternatives: ["task", "goal"] }), "x", "2026-11-21");
    expect(r?.confidence).toBe(1);
    expect(r?.alternatives).toEqual(["goal"]);
  });
});

describe("advisor prompt", () => {
  it("adapts to recovery mode and advisor role", () => {
    const p = buildSystemPrompt({ mode: "COACH", displayName: "Lucas", today: "2026-11-21", recoveryMode: true });
    expect(p).toContain("recovery mode");
    expect(p).toContain("Style: coach");
    expect(p).toContain("not diagnose");
  });
  it("the offline answer states it is not an AI answer and lists sources", () => {
    const a = offlineAnswer({ core: [], matches: [{ ref: { kind: "task", id: "1", label: "x" }, text: "Task: Call dentist" }] }, "AI is off, so this is not an AI answer.");
    expect(a).toContain("not an AI answer");
    expect(a).toContain("Call dentist");
  });
});
