import { describe, expect, it } from "vitest";
import { computeAttention, type AttentionInput } from "@/server/modules/dashboard/attention";

const base: AttentionInput = {
  today: "2026-11-21",
  recoveryMode: false,
  overdueTasks: [],
  postponedTasks: [],
  activeProjectCount: 2,
  goalsWithoutNextStep: [],
  pendingCaptures: 0,
  plannedMinutesToday: 0,
};

describe("attention rules", () => {
  it("is empty for a calm day", () => {
    expect(computeAttention(base)).toEqual([]);
  });

  it("distinguishes important items from observations", () => {
    const items = computeAttention({
      ...base,
      overdueTasks: [{ id: "t", title: "Pay invoice", dueDate: "2026-11-19", priority: 2 }],
      activeProjectCount: 7,
    });
    expect(items.find((i) => i.id === "overdue:t")?.level).toBe("important");
    expect(items.find((i) => i.id === "projects")?.level).toBe("observation");
  });

  it("hides patterns and low-priority overdue items in recovery mode", () => {
    const items = computeAttention({
      ...base,
      recoveryMode: true,
      overdueTasks: [
        { id: "a", title: "Low", dueDate: "2026-11-19", priority: 3 },
        { id: "b", title: "High", dueDate: "2026-11-19", priority: 1 },
      ],
      postponedTasks: [{ id: "p", title: "Admin", postponedCount: 5 }],
      activeProjectCount: 9,
      plannedMinutesToday: 900,
      pendingCaptures: 1,
    });
    expect(items.map((i) => i.id)).toEqual(["overdue:b", "captures"]);
  });

  it("flags overplanned days", () => {
    expect(computeAttention({ ...base, plannedMinutesToday: 600 }).map((i) => i.id)).toContain("overplanned");
  });
});
