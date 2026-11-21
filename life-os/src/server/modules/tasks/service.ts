import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { notFound, AppError } from "@/lib/errors";
import { dateKeyToDate, type DateKey } from "@/lib/dates";
import type { taskCreate, taskUpdate } from "@/lib/schemas/records";
import { db } from "../../db";

type Tx = Prisma.TransactionClient;

const toDate = (k: string | null | undefined) => (k === undefined ? undefined : k === null ? null : dateKeyToDate(k));

async function assertRefs(userId: string, input: { projectId?: string | null; goalId?: string | null }, tx: Tx = db) {
  // A user may only link their own project/goal: otherwise a crafted id could
  // attach a task to someone else's record.
  if (input.projectId && !(await tx.project.findFirst({ where: { id: input.projectId, userId }, select: { id: true } })))
    throw notFound("Project");
  if (input.goalId && !(await tx.goal.findFirst({ where: { id: input.goalId, userId }, select: { id: true } })))
    throw notFound("Goal");
}

export async function createTask(userId: string, input: z.infer<typeof taskCreate>, extra: { captureId?: string } = {}, tx: Tx = db) {
  await assertRefs(userId, input, tx);
  return tx.task.create({
    data: {
      userId,
      title: input.title,
      notes: input.notes ?? null,
      dueDate: toDate(input.dueDate) ?? null,
      scheduledFor: toDate(input.scheduledFor) ?? null,
      priority: input.priority ?? 2,
      estimateMinutes: input.estimateMinutes ?? null,
      effort: input.effort ?? null,
      projectId: input.projectId ?? null,
      goalId: input.goalId ?? null,
      captureId: extra.captureId ?? null,
    },
  });
}

export async function getTask(userId: string, id: string) {
  const task = await db.task.findFirst({ where: { id, userId, archivedAt: null } });
  if (!task) throw notFound("Task");
  return task;
}

export async function updateTask(userId: string, id: string, input: z.infer<typeof taskUpdate>) {
  const task = await getTask(userId, id);
  await assertRefs(userId, input);
  const data: Prisma.TaskUncheckedUpdateInput = {
    ...(input.title !== undefined && { title: input.title }),
    ...(input.notes !== undefined && { notes: input.notes }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.estimateMinutes !== undefined && { estimateMinutes: input.estimateMinutes }),
    ...(input.effort !== undefined && { effort: input.effort }),
    ...(input.projectId !== undefined && { projectId: input.projectId }),
    ...(input.goalId !== undefined && { goalId: input.goalId }),
    ...(input.scheduledFor !== undefined && { scheduledFor: toDate(input.scheduledFor) }),
  };
  if (input.dueDate !== undefined) {
    const next = toDate(input.dueDate);
    data.dueDate = next;
    // Count postponements (moving a due date later) to surface, not to shame.
    if (task.dueDate && next && next > task.dueDate) data.postponedCount = task.postponedCount + 1;
  }
  if (input.status !== undefined) {
    data.status = input.status;
    data.completedAt = input.status === "DONE" ? (task.completedAt ?? new Date()) : null;
  }
  return db.task.update({ where: { id }, data });
}

/** Soft delete so the UI can offer Undo. */
export async function archiveTask(userId: string, id: string) {
  await getTask(userId, id);
  return db.task.update({ where: { id }, data: { archivedAt: new Date() } });
}

export async function restoreTask(userId: string, id: string) {
  const task = await db.task.findFirst({ where: { id, userId } });
  if (!task) throw notFound("Task");
  if (!task.archivedAt) throw new AppError("CONFLICT", "Task is not archived");
  return db.task.update({ where: { id }, data: { archivedAt: null } });
}

export function listTasks(
  userId: string,
  filter: { status?: "TODO" | "DONE" | "CANCELLED"; dueOnOrBefore?: DateKey; projectId?: string; take?: number } = {},
) {
  return db.task.findMany({
    where: {
      userId,
      archivedAt: null,
      ...(filter.status && { status: filter.status }),
      ...(filter.projectId && { projectId: filter.projectId }),
      ...(filter.dueOnOrBefore && { dueDate: { lte: dateKeyToDate(filter.dueOnOrBefore) } }),
    },
    include: { project: { select: { id: true, title: true } } },
    orderBy: [{ status: "asc" }, { dueDate: { sort: "asc", nulls: "last" } }, { priority: "asc" }, { createdAt: "desc" }],
    take: filter.take ?? 200,
  });
}
