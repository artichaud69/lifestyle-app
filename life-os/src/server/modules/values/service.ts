import type { z } from "zod";
import { notFound } from "@/lib/errors";
import type { valueCreate, valueUpdate } from "@/lib/schemas/records";
import { db } from "../../db";

export function listValues(userId: string) {
  return db.personalValue.findMany({ where: { userId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
}

export async function createValue(userId: string, input: z.infer<typeof valueCreate>) {
  const count = await db.personalValue.count({ where: { userId } });
  return db.personalValue.create({ data: { userId, name: input.name, description: input.description ?? null, sortOrder: count } });
}

export async function updateValue(userId: string, id: string, input: z.infer<typeof valueUpdate>) {
  if (!(await db.personalValue.findFirst({ where: { id, userId } }))) throw notFound("Value");
  return db.personalValue.update({ where: { id }, data: input });
}

export async function deleteValue(userId: string, id: string) {
  if (!(await db.personalValue.findFirst({ where: { id, userId } }))) throw notFound("Value");
  await db.personalValue.delete({ where: { id } });
}
