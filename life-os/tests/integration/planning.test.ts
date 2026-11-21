import { describe, expect, it } from "vitest";
import { db } from "@/server/db";
import { addPlanItem, getOrCreatePlan, updatePlanItem } from "@/server/modules/planning/service";
import { createTask, updateTask } from "@/server/modules/tasks/service";
import { makeUser } from "./helpers";

describe("daily planning", () => {
  it("keeps a single main priority, demoting the previous one", async () => {
    const user = await makeUser();
    await addPlanItem(user.id, "2026-11-21", { kind: "MAIN", label: "Write the strategy memo" });
    await addPlanItem(user.id, "2026-11-21", { kind: "MAIN", label: "Finish the forecast" });
    const plan = await getOrCreatePlan(user.id, "2026-11-21");
    expect(plan.items.filter((i) => i.kind === "MAIN").map((i) => i.label)).toEqual(["Finish the forecast"]);
    expect(plan.items.filter((i) => i.kind === "OPTIONAL").map((i) => i.label)).toEqual(["Write the strategy memo"]);
  });

  it("limits optional priorities", async () => {
    const user = await makeUser();
    for (const l of ["a", "b", "c"]) await addPlanItem(user.id, "2026-11-21", { kind: "OPTIONAL", label: l });
    await expect(addPlanItem(user.id, "2026-11-21", { kind: "OPTIONAL", label: "d" })).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("completing a linked plan item completes the task", async () => {
    const user = await makeUser();
    const task = await createTask(user.id, { title: "Run 5 km" });
    const item = await addPlanItem(user.id, "2026-11-21", { kind: "MAIN", taskId: task.id });
    expect(item.label).toBe("Run 5 km");
    await updatePlanItem(user.id, item.id, { done: true });
    expect((await db.task.findUniqueOrThrow({ where: { id: task.id } })).status).toBe("DONE");
  });

  it("counts postponements when a due date moves later", async () => {
    const user = await makeUser();
    const task = await createTask(user.id, { title: "Tax return", dueDate: "2026-11-20" });
    await updateTask(user.id, task.id, { dueDate: "2026-11-25" });
    await updateTask(user.id, task.id, { dueDate: "2026-11-22" }); // earlier: not a postponement
    expect((await db.task.findUniqueOrThrow({ where: { id: task.id } })).postponedCount).toBe(1);
  });
});
