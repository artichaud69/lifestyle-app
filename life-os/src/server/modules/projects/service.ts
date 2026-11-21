import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { notFound } from "@/lib/errors";
import { dateKeyToDate } from "@/lib/dates";
import type { projectCreate, projectUpdate } from "@/lib/schemas/records";
import { db } from "../../db";
import { domainIdForKey } from "../domains/service";

type Tx = Prisma.TransactionClient;

export async function createProject(userId: string, input: z.infer<typeof projectCreate>, extra: { captureId?: string } = {}, tx: Tx = db) {
  if (input.goalId && !(await tx.goal.findFirst({ where: { id: input.goalId, userId } }))) throw notFound("Goal");
  return tx.project.create({
    data: {
      userId,
      title: input.title,
      purpose: input.purpose ?? null,
      description: input.description ?? null,
      kind: input.kind ?? "PERSONAL",
      status: input.status ?? "IDEA",
      nextAction: input.nextAction ?? null,
      targetDate: input.targetDate ? dateKeyToDate(input.targetDate) : null,
      goalId: input.goalId ?? null,
      domainId: await domainIdForKey(userId, input.domainKey),
      captureId: extra.captureId ?? null,
    },
  });
}

export async function getProject(userId: string, id: string) {
  const p = await db.project.findFirst({
    where: { id, userId, archivedAt: null },
    include: { tasks: { where: { archivedAt: null }, orderBy: [{ status: "asc" }, { createdAt: "asc" }] }, goal: true },
  });
  if (!p) throw notFound("Project");
  return p;
}

export async function updateProject(userId: string, id: string, input: z.infer<typeof projectUpdate>) {
  await getProject(userId, id);
  if (input.goalId && !(await db.goal.findFirst({ where: { id: input.goalId, userId } }))) throw notFound("Goal");
  const { domainKey, targetDate, ...rest } = input;
  return db.project.update({
    where: { id },
    data: {
      ...rest,
      ...(domainKey !== undefined && { domainId: await domainIdForKey(userId, domainKey) }),
      ...(targetDate !== undefined && { targetDate: targetDate ? dateKeyToDate(targetDate) : null }),
    },
  });
}

export async function archiveProject(userId: string, id: string) {
  await getProject(userId, id);
  return db.project.update({ where: { id }, data: { archivedAt: new Date() } });
}

export function listProjects(userId: string) {
  return db.project.findMany({
    where: { userId, archivedAt: null },
    include: {
      goal: { select: { id: true, title: true } },
      _count: { select: { tasks: { where: { status: "TODO", archivedAt: null } } } },
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });
}
