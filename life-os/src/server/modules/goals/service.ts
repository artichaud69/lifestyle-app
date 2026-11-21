import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { notFound } from "@/lib/errors";
import { dateKeyToDate } from "@/lib/dates";
import type { goalCreate, goalUpdate, milestoneCreate, milestoneUpdate } from "@/lib/schemas/records";
import { db } from "../../db";
import { domainIdForKey } from "../domains/service";

type Tx = Prisma.TransactionClient;

export async function createGoal(userId: string, input: z.infer<typeof goalCreate>, extra: { captureId?: string } = {}, tx: Tx = db) {
  if (input.parentId && !(await tx.goal.findFirst({ where: { id: input.parentId, userId } }))) throw notFound("Parent goal");
  return tx.goal.create({
    data: {
      userId,
      title: input.title,
      description: input.description ?? null,
      motivation: input.motivation ?? null,
      domainId: await domainIdForKey(userId, input.domainKey),
      horizon: input.horizon ?? "OPEN",
      priority: input.priority ?? 2,
      targetDate: input.targetDate ? dateKeyToDate(input.targetDate) : null,
      progressMeasure: input.progressMeasure ?? null,
      parentId: input.parentId ?? null,
      captureId: extra.captureId ?? null,
    },
  });
}

export async function getGoal(userId: string, id: string) {
  const goal = await db.goal.findFirst({
    where: { id, userId, archivedAt: null },
    include: { milestones: { orderBy: { sortOrder: "asc" } }, domain: true, projects: true, children: true },
  });
  if (!goal) throw notFound("Goal");
  return goal;
}

export async function updateGoal(userId: string, id: string, input: z.infer<typeof goalUpdate>) {
  await getGoal(userId, id);
  if (input.parentId) {
    if (input.parentId === id || !(await db.goal.findFirst({ where: { id: input.parentId, userId } }))) throw notFound("Parent goal");
  }
  const { domainKey, targetDate, ...rest } = input;
  return db.goal.update({
    where: { id },
    data: {
      ...rest,
      ...(domainKey !== undefined && { domainId: await domainIdForKey(userId, domainKey) }),
      ...(targetDate !== undefined && { targetDate: targetDate ? dateKeyToDate(targetDate) : null }),
    },
  });
}

export async function archiveGoal(userId: string, id: string) {
  await getGoal(userId, id);
  return db.goal.update({ where: { id }, data: { archivedAt: new Date() } });
}

export function listGoals(userId: string, opts: { status?: "ACTIVE" | "PAUSED" | "ACHIEVED" | "RELEASED" } = {}) {
  return db.goal.findMany({
    where: { userId, archivedAt: null, ...(opts.status && { status: opts.status }) },
    include: {
      domain: { select: { key: true, name: true } },
      milestones: { orderBy: { sortOrder: "asc" } },
      _count: { select: { tasks: { where: { status: "TODO", archivedAt: null } }, projects: true } },
    },
    orderBy: [{ status: "asc" }, { priority: "asc" }, { createdAt: "desc" }],
  });
}

export async function addMilestone(userId: string, goalId: string, input: z.infer<typeof milestoneCreate>) {
  await getGoal(userId, goalId);
  const count = await db.goalMilestone.count({ where: { goalId } });
  return db.goalMilestone.create({
    data: { goalId, title: input.title, dueDate: input.dueDate ? dateKeyToDate(input.dueDate) : null, sortOrder: count },
  });
}

export async function updateMilestone(userId: string, id: string, input: z.infer<typeof milestoneUpdate>) {
  const m = await db.goalMilestone.findFirst({ where: { id, goal: { userId } } });
  if (!m) throw notFound("Milestone");
  return db.goalMilestone.update({
    where: { id },
    data: {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.done !== undefined && { doneAt: input.done ? new Date() : null }),
    },
  });
}

export async function deleteMilestone(userId: string, id: string) {
  const m = await db.goalMilestone.findFirst({ where: { id, goal: { userId } } });
  if (!m) throw notFound("Milestone");
  await db.goalMilestone.delete({ where: { id } });
}
