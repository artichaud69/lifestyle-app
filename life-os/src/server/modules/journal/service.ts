import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { notFound } from "@/lib/errors";
import type { journalCreate, journalUpdate } from "@/lib/schemas/records";
import { db } from "../../db";
import { audit } from "../../audit";

type Tx = Prisma.TransactionClient;

export function createJournalEntry(userId: string, input: z.infer<typeof journalCreate>, extra: { captureId?: string } = {}, tx: Tx = db) {
  return tx.journalEntry.create({
    data: {
      userId,
      body: input.body,
      title: input.title ?? null,
      mood: input.mood ?? null,
      energy: input.energy ?? null,
      tags: input.tags ?? [],
      occurredAt: input.occurredAt ? new Date(input.occurredAt) : new Date(),
      excludeFromAi: input.excludeFromAi ?? false,
      captureId: extra.captureId ?? null,
    },
  });
}

export async function getJournalEntry(userId: string, id: string) {
  const e = await db.journalEntry.findFirst({ where: { id, userId } });
  if (!e) throw notFound("Journal entry");
  return e;
}

export async function updateJournalEntry(userId: string, id: string, input: z.infer<typeof journalUpdate>) {
  await getJournalEntry(userId, id);
  const { occurredAt, ...rest } = input;
  return db.journalEntry.update({
    where: { id },
    data: { ...rest, ...(occurredAt && { occurredAt: new Date(occurredAt) }) },
  });
}

/**
 * Hard delete. Memories that were derived only from this entry are deleted
 * too, so "delete" really removes what the system learned from it.
 */
export async function deleteJournalEntry(userId: string, id: string) {
  await getJournalEntry(userId, id);
  await db.$transaction(async (tx) => {
    const derived = await tx.memorySource.findMany({
      where: { sourceType: "JOURNAL", sourceId: id, memory: { userId } },
      select: { memoryId: true },
    });
    for (const { memoryId } of derived) {
      const others = await tx.memorySource.count({ where: { memoryId, NOT: { sourceType: "JOURNAL", sourceId: id } } });
      if (others === 0) await tx.memory.delete({ where: { id: memoryId } });
      else await tx.memorySource.deleteMany({ where: { memoryId, sourceType: "JOURNAL", sourceId: id } });
    }
    await tx.journalEntry.delete({ where: { id } });
  });
  await audit(userId, "journal.delete", { type: "JournalEntry", id });
}

export function listJournalEntries(userId: string, opts: { take?: number; cursor?: string } = {}) {
  return db.journalEntry.findMany({
    where: { userId },
    orderBy: { occurredAt: "desc" },
    take: opts.take ?? 50,
    ...(opts.cursor && { cursor: { id: opts.cursor }, skip: 1 }),
  });
}
