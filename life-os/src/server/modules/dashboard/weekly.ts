import { addDays, dateKeyToDate, localDateKey, startOfWeek } from "@/lib/dates";
import { db } from "../../db";
import { getSettings } from "../settings/service";

/**
 * A deterministic summary of the current week: what happened, from records
 * only. No scores, no interpretation — the AI-written weekly review (with
 * evidence links) is Phase 2.
 */
export async function getWeekSummary(userId: string) {
  const s = await getSettings(userId);
  const today = localDateKey(s.timezone);
  const start = startOfWeek(today, s.weekStartsOn);
  const end = addDays(start, 7);
  const range = { gte: dateKeyToDate(start), lt: dateKeyToDate(end) };

  const [completed, created, journal, plans, captures] = await Promise.all([
    db.task.findMany({ where: { userId, completedAt: range }, select: { id: true, title: true, project: { select: { title: true } } } }),
    db.task.count({ where: { userId, createdAt: range } }),
    db.journalEntry.findMany({ where: { userId, occurredAt: range }, select: { id: true, mood: true, occurredAt: true } }),
    db.dailyPlan.findMany({ where: { userId, date: range }, include: { items: true } }),
    db.capture.count({ where: { userId, createdAt: range } }),
  ]);

  const items = plans.flatMap((p) => p.items);
  const byKind = (k: string) => items.filter((i) => i.kind === k);
  const leisure = byKind("LEISURE");
  const mainFocus = byKind("MAIN");
  return {
    start,
    end: addDays(end, -1),
    completed,
    createdTasks: created,
    journalEntries: journal.length,
    moodsLogged: journal.filter((j) => j.mood !== null).map((j) => j.mood as number),
    captures,
    mainFocus: { planned: mainFocus.length, done: mainFocus.filter((i) => i.doneAt).length, labels: mainFocus.map((i) => ({ label: i.label, done: !!i.doneAt })) },
    leisure: {
      planned: leisure.length,
      minutes: leisure.reduce((s, i) => s + (i.minutes ?? 0), 0),
      aligned: leisure.filter((i) => i.aligned === true).length,
      notAligned: leisure.filter((i) => i.aligned === false).length,
    },
    recovery: byKind("RECOVERY").length,
  };
}
