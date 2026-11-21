import type { Prisma } from "@prisma/client";
import { db } from "./db";

// Security-relevant and consequential events. Never put record content here —
// only identifiers and small, non-sensitive metadata.
export async function audit(
  userId: string | null,
  action: string,
  entity?: { type: string; id: string },
  metadata?: Prisma.InputJsonValue,
) {
  try {
    await db.auditLog.create({
      data: { userId, action, entityType: entity?.type, entityId: entity?.id, metadata },
    });
  } catch (err) {
    // Auditing must not break the user's action; surface in server logs.
    console.error("audit log write failed", action, err);
  }
}
