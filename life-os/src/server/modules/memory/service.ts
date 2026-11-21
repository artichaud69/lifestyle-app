import type { MemoryLayer, MemoryStatus, Prisma, SourceType } from "@prisma/client";
import type { z } from "zod";
import { notFound } from "@/lib/errors";
import type { memoryCreate, memoryUpdate } from "@/lib/schemas/records";
import { db } from "../../db";
import { audit } from "../../audit";

type Tx = Prisma.TransactionClient;

export async function createMemory(
  userId: string,
  input: z.infer<typeof memoryCreate> & { status?: MemoryStatus; confidence?: number },
  source: { type: SourceType; id?: string | null; excerpt?: string | null },
  tx: Tx = db,
) {
  return tx.memory.create({
    data: {
      userId,
      layer: input.layer,
      status: input.status ?? "USER_STATED",
      confidence: input.confidence ?? 1,
      content: input.content,
      domainKey: input.domainKey ?? null,
      sensitivity: input.sensitivity ?? "PERSONAL",
      sources: { create: { sourceType: source.type, sourceId: source.id ?? null, excerpt: source.excerpt?.slice(0, 500) ?? null } },
    },
    include: { sources: true },
  });
}

export function listMemories(userId: string, opts: { layer?: MemoryLayer; includeRejected?: boolean } = {}) {
  return db.memory.findMany({
    where: {
      userId,
      supersededById: null,
      ...(opts.layer && { layer: opts.layer }),
      ...(!opts.includeRejected && { status: { not: "REJECTED" } }),
    },
    include: { sources: true },
    orderBy: [{ layer: "asc" }, { updatedAt: "desc" }],
  });
}

async function owned(userId: string, id: string) {
  const m = await db.memory.findFirst({ where: { id, userId }, include: { sources: true } });
  if (!m) throw notFound("Memory");
  return m;
}

export async function updateMemory(userId: string, id: string, input: z.infer<typeof memoryUpdate>) {
  const m = await owned(userId, id);
  const data: Prisma.MemoryUpdateInput = {};
  if (input.excludedFromAi !== undefined) data.excludedFromAi = input.excludedFromAi;
  if (input.sensitivity !== undefined) data.sensitivity = input.sensitivity;
  if (input.content !== undefined && input.content !== m.content) {
    data.content = input.content;
    // The user rewrote it in their own words: no longer an unverified inference.
    if (m.status === "AI_INFERENCE" || m.status === "SPECULATIVE") data.status = "USER_CONFIRMED";
    data.lastVerifiedAt = new Date();
  }
  if (input.verdict === "confirm") {
    if (m.status !== "USER_STATED") data.status = "USER_CONFIRMED";
    data.confidence = 1;
    data.lastVerifiedAt = new Date();
  } else if (input.verdict === "reject") {
    // Kept (not deleted) so the same inference is not proposed again, but
    // excluded from all AI context.
    data.status = "REJECTED";
    data.excludedFromAi = true;
    data.lastVerifiedAt = new Date();
  }
  const updated = await db.memory.update({ where: { id }, data, include: { sources: true } });
  if (input.verdict) await audit(userId, `memory.${input.verdict}`, { type: "Memory", id });
  return updated;
}

export async function deleteMemory(userId: string, id: string) {
  await owned(userId, id);
  await db.memory.delete({ where: { id } });
  await audit(userId, "memory.delete", { type: "Memory", id });
}

/** "Why do you believe this about me?" — the memory plus its resolved sources. */
export async function explainMemory(userId: string, id: string) {
  const m = await owned(userId, id);
  const sources = await Promise.all(
    m.sources.map(async (s) => ({ ...s, label: await describeSource(userId, s.sourceType, s.sourceId) })),
  );
  return { ...m, sources };
}

async function describeSource(userId: string, type: SourceType, sourceId: string | null): Promise<string> {
  if (!sourceId) return type === "USER" ? "You added this directly" : "Unknown source";
  switch (type) {
    case "CAPTURE": {
      const c = await db.capture.findFirst({ where: { id: sourceId, userId } });
      return c ? `Quick capture: “${c.rawText}”` : "A capture that has since been deleted";
    }
    case "JOURNAL": {
      const j = await db.journalEntry.findFirst({ where: { id: sourceId, userId } });
      return j ? `Journal entry of ${j.occurredAt.toISOString().slice(0, 10)}` : "A deleted journal entry";
    }
    case "CONVERSATION": {
      const c = await db.aIConversation.findFirst({ where: { id: sourceId, userId } });
      return c ? `Advisor conversation “${c.title}”` : "A deleted conversation";
    }
    default:
      return `${type.toLowerCase()} ${sourceId}`;
  }
}
