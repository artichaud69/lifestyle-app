import { addDays, dateKeyToDate, dateToKey, localDateKey } from "@/lib/dates";
import { db } from "../../db";
import { getSettings } from "../settings/service";
import { getOrCreatePlan } from "../planning/service";
import { listPendingCaptures } from "../capture/service";
import { computeAttention } from "./attention";

export async function getDashboard(userId: string) {
  const settings = await getSettings(userId);
  const today = localDateKey(settings.timezone);
  const todayDate = dateKeyToDate(today);

  const [plan, dueTasks, upcoming, goals, activeProjects, pending, postponed, domains, recentJournal] = await Promise.all([
    getOrCreatePlan(userId, today),
    db.task.findMany({
      where: { userId, status: "TODO", archivedAt: null, dueDate: { lte: todayDate } },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
      take: 30,
    }),
    db.task.findMany({
      where: { userId, status: "TODO", archivedAt: null, dueDate: { gt: todayDate, lte: dateKeyToDate(addDays(today, 7)) } },
      orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
      take: 15,
    }),
    db.goal.findMany({
      where: { userId, status: "ACTIVE", archivedAt: null },
      include: {
        domain: { select: { key: true, name: true } },
        _count: { select: { tasks: { where: { status: "TODO", archivedAt: null } }, projects: { where: { status: { in: ["ACTIVE", "IDEA"] } } } } },
      },
      orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
    }),
    db.project.findMany({ where: { userId, status: "ACTIVE", archivedAt: null }, orderBy: { updatedAt: "desc" } }),
    listPendingCaptures(userId),
    db.task.findMany({ where: { userId, status: "TODO", archivedAt: null, postponedCount: { gte: 3 } }, take: 5 }),
    db.lifeDomain.findMany({ where: { userId, isActive: true }, orderBy: { sortOrder: "asc" } }),
    db.journalEntry.count({ where: { userId, occurredAt: { gte: dateKeyToDate(addDays(today, -7)) } } }),
  ]);

  const overdue = dueTasks.filter((t) => t.dueDate && dateToKey(t.dueDate) < today);
  const attention = computeAttention({
    today,
    recoveryMode: settings.recoveryMode,
    overdueTasks: overdue.map((t) => ({ id: t.id, title: t.title, dueDate: dateToKey(t.dueDate!), priority: t.priority })),
    postponedTasks: postponed,
    activeProjectCount: activeProjects.length,
    goalsWithoutNextStep: goals.filter((g) => g._count.tasks === 0 && g._count.projects === 0),
    pendingCaptures: pending.length,
    plannedMinutesToday: plan.items.reduce((s, i) => s + (i.minutes ?? 0), 0),
  });

  const goalsByDomain = new Map<string, number>();
  for (const g of goals) if (g.domain) goalsByDomain.set(g.domain.key, (goalsByDomain.get(g.domain.key) ?? 0) + 1);

  return {
    today,
    settings,
    plan,
    dueTasks,
    upcoming,
    goals,
    activeProjects,
    pending,
    attention,
    recentJournalCount: recentJournal,
    domains: domains.map((d) => ({ ...d, activeGoals: goalsByDomain.get(d.key) ?? 0 })),
  };
}
