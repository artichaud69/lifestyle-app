import { db } from "../../db";
import { audit } from "../../audit";

export const EXPORT_FORMAT_VERSION = 1;

/**
 * Full export of everything the user owns, as documented JSON
 * (docs/DATA_EXPORT.md). Secrets (password hash, session token hashes) are
 * never included.
 */
export async function exportAll(userId: string) {
  const [user, settings, consents, aiPermissions, domains, values, goals, projects, tasks, plans, journal, curiosity, captures, memories, conversations] =
    await Promise.all([
      db.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true, displayName: true, createdAt: true, onboardedAt: true } }),
      db.userSettings.findUnique({ where: { userId } }),
      db.userConsent.findMany({ where: { userId }, orderBy: { createdAt: "asc" } }),
      db.aiDomainPermission.findMany({ where: { userId } }),
      db.lifeDomain.findMany({ where: { userId } }),
      db.personalValue.findMany({ where: { userId } }),
      db.goal.findMany({ where: { userId }, include: { milestones: true } }),
      db.project.findMany({ where: { userId } }),
      db.task.findMany({ where: { userId } }),
      db.dailyPlan.findMany({ where: { userId }, include: { items: true } }),
      db.journalEntry.findMany({ where: { userId } }),
      db.curiosityItem.findMany({ where: { userId } }),
      db.capture.findMany({ where: { userId } }),
      db.memory.findMany({ where: { userId }, include: { sources: true } }),
      db.aIConversation.findMany({ where: { userId }, include: { messages: true } }),
    ]);
  await audit(userId, "export.download");
  return {
    format: "life-os-export",
    version: EXPORT_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    user,
    settings,
    consents,
    aiPermissions,
    domains,
    values,
    goals,
    projects,
    tasks,
    dailyPlans: plans,
    journalEntries: journal,
    curiosityItems: curiosity,
    captures,
    memories,
    conversations,
  };
}
