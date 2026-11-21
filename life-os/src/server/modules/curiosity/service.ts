import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { notFound } from "@/lib/errors";
import type { curiosityUpdate } from "@/lib/schemas/records";
import { db } from "../../db";

export function createCuriosity(userId: string, input: { question: string; theme?: string | null }, extra: { captureId?: string } = {}, tx: Prisma.TransactionClient = db) {
  return tx.curiosityItem.create({
    data: { userId, question: input.question, theme: input.theme ?? null, captureId: extra.captureId ?? null },
  });
}

export function listCuriosity(userId: string) {
  return db.curiosityItem.findMany({ where: { userId }, orderBy: [{ status: "asc" }, { createdAt: "desc" }] });
}

export async function updateCuriosity(userId: string, id: string, input: z.infer<typeof curiosityUpdate>) {
  if (!(await db.curiosityItem.findFirst({ where: { id, userId } }))) throw notFound("Curiosity item");
  return db.curiosityItem.update({ where: { id }, data: input });
}

export async function deleteCuriosity(userId: string, id: string) {
  if (!(await db.curiosityItem.findFirst({ where: { id, userId } }))) throw notFound("Curiosity item");
  await db.curiosityItem.delete({ where: { id } });
}
