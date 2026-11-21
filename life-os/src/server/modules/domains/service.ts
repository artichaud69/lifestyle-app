import type { z } from "zod";
import { notFound } from "@/lib/errors";
import type { domainUpdate } from "@/lib/schemas/records";
import { db } from "../../db";

export function listDomains(userId: string, opts: { activeOnly?: boolean } = {}) {
  return db.lifeDomain.findMany({
    where: { userId, ...(opts.activeOnly ? { isActive: true } : {}) },
    orderBy: { sortOrder: "asc" },
  });
}

export async function domainIdForKey(userId: string, key: string | null | undefined) {
  if (!key) return null;
  const d = await db.lifeDomain.findUnique({ where: { userId_key: { userId, key } } });
  return d?.id ?? null;
}

export async function updateDomain(userId: string, id: string, input: z.infer<typeof domainUpdate>) {
  const existing = await db.lifeDomain.findFirst({ where: { id, userId } });
  if (!existing) throw notFound("Life domain");
  return db.lifeDomain.update({ where: { id }, data: input });
}
