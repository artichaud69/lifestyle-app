import { describe, expect, it } from "vitest";
import { formatContext, toTsQuery } from "@/server/modules/retrieval/service";

describe("toTsQuery", () => {
  it("keeps meaningful words as OR prefix terms", () => {
    expect(toTsQuery("Why do I feel guilty when I play video games?")).toBe("feel:* | guilty:* | play:* | video:* | games:*");
  });
  it("cannot inject tsquery operators", () => {
    const q = toTsQuery("dentist & !(x | y):* <-> 'drop'");
    expect(q).toBe("dentist:* | drop:*");
  });
  it("returns null for questions with no searchable words", () => {
    expect(toTsQuery("what should I do?")).toBeNull();
  });
  it("handles accented French words", () => {
    expect(toTsQuery("Pourquoi je me sens fatigué")).toBe("pourquoi:* | sens:* | fatigué:*");
  });
});

describe("formatContext", () => {
  it("tags every item with a citable reference", () => {
    const text = formatContext({
      core: [{ ref: { kind: "goal", id: "g1", label: "Run" }, text: "Active goal: Run" }],
      matches: [{ ref: { kind: "task", id: "t1", label: "Call" }, text: "Task: Call" }],
    });
    expect(text).toContain("[goal:g1] Active goal: Run");
    expect(text).toContain("[task:t1] Task: Call");
  });
  it("says so when nothing is available, instead of leaving it blank", () => {
    expect(formatContext({ core: [], matches: [] })).toMatch(/No personal records/);
  });
});
