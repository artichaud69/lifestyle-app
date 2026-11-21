import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { AppError, notFound } from "@/lib/errors";
import { dateKeyToDate, type DateKey } from "@/lib/dates";
import type { planItemCreate, planItemUpdate, planUpdate } from "@/lib/schemas/records";
import { db } from "../../db";

type Tx = Prisma.TransactionClient;

export const MAX_OPTIONAL = 3;

const planInclude = {
  items: {
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { task: { select: { id: true, title: true, status: true } } },
  },
} satisfies Prisma.DailyPlanInclude;

export async function getOrCreatePlan(userId: string, date: DateKey, tx: Tx = db) {
  return tx.dailyPlan.upsert({
    where: { userId_date: { userId, date: dateKeyToDate(date) } },
    create: { userId, date: dateKeyToDate(date) },
    update: {},
    include: planInclude,
  });
}

export async function findPlan(userId: string, date: DateKey) {
  return db.dailyPlan.findUnique({ where: { userId_date: { userId, date: dateKeyToDate(date) } }, include: planInclude });
}

export async function updatePlan(userId: string, date: DateKey, input: z.infer<typeof planUpdate>) {
  const plan = await getOrCreatePlan(userId, date);
  await db.dailyPlan.update({ where: { id: plan.id }, data: input });
  return getOrCreatePlan(userId, date);
}

export async function addPlanItem(
  userId: string,
  date: DateKey,
  input: z.infer<typeof planItemCreate>,
  extra: { captureId?: string } = {},
  tx: Tx = db,
) {
  const plan = await getOrCreatePlan(userId, date, tx);
  let label = input.label;
  if (input.taskId) {
    const task = await tx.task.findFirst({ where: { id: input.taskId, userId, archivedAt: null } });
    if (!task) throw notFound("Task");
    label ??= task.title;
  }
  if (!label) throw new AppError("VALIDATION", "A plan item needs a label or a task");

  if (input.kind === "MAIN") {
    // Only one main priority: an existing one becomes optional, not lost.
    await tx.dailyPlanItem.updateMany({ where: { planId: plan.id, kind: "MAIN" }, data: { kind: "OPTIONAL" } });
  }
  if (input.kind === "OPTIONAL") {
    const optional = await tx.dailyPlanItem.count({ where: { planId: plan.id, kind: "OPTIONAL" } });
    if (optional >= MAX_OPTIONAL)
      throw new AppError("CONFLICT", `Keep it to ${MAX_OPTIONAL} optional priorities — the rest can wait in your task list.`);
  }
  const count = await tx.dailyPlanItem.count({ where: { planId: plan.id } });
  return tx.dailyPlanItem.create({
    data: {
      planId: plan.id,
      kind: input.kind,
      label,
      taskId: input.taskId ?? null,
      minutes: input.minutes ?? null,
      sortOrder: count,
      captureId: extra.captureId ?? null,
    },
  });
}

async function ownedItem(userId: string, id: string) {
  const item = await db.dailyPlanItem.findFirst({ where: { id, plan: { userId } } });
  if (!item) throw notFound("Plan item");
  return item;
}

export async function updatePlanItem(userId: string, id: string, input: z.infer<typeof planItemUpdate>) {
  const item = await ownedItem(userId, id);
  return db.$transaction(async (tx) => {
    const updated = await tx.dailyPlanItem.update({
      where: { id },
      data: {
        ...(input.label !== undefined && { label: input.label }),
        ...(input.minutes !== undefined && { minutes: input.minutes }),
        ...(input.aligned !== undefined && { aligned: input.aligned }),
        ...(input.done !== undefined && { doneAt: input.done ? new Date() : null }),
      },
    });
    // Completing a plan item that points at a task completes the task too.
    if (input.done !== undefined && item.taskId) {
      await tx.task.updateMany({
        where: { id: item.taskId, userId },
        data: input.done ? { status: "DONE", completedAt: new Date() } : { status: "TODO", completedAt: null },
      });
    }
    return updated;
  });
}

export async function deletePlanItem(userId: string, id: string) {
  await ownedItem(userId, id);
  await db.dailyPlanItem.delete({ where: { id } });
}
