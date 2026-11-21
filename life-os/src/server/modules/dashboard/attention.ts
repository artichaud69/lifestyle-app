// Pure rules for the "Attention" panel, separated from data loading so they
// are easy to test and to reason about. Levels: "important" deserves action,
// "observation" is a pattern worth noticing, "info" is purely informational.

export type AttentionItem = {
  id: string;
  level: "important" | "observation" | "info";
  title: string;
  detail?: string;
  href?: string;
};

export type AttentionInput = {
  today: string;
  recoveryMode: boolean;
  overdueTasks: Array<{ id: string; title: string; dueDate: string; priority: number }>;
  postponedTasks: Array<{ id: string; title: string; postponedCount: number }>;
  activeProjectCount: number;
  goalsWithoutNextStep: Array<{ id: string; title: string; priority: number }>;
  pendingCaptures: number;
  plannedMinutesToday: number;
};

export const ACTIVE_PROJECT_SOFT_LIMIT = 5;
export const POSTPONE_THRESHOLD = 3;

export function computeAttention(i: AttentionInput): AttentionItem[] {
  const out: AttentionItem[] = [];

  const overdue = i.recoveryMode ? i.overdueTasks.filter((t) => t.priority === 1) : i.overdueTasks;
  if (overdue.length === 1) {
    const t = overdue[0]!;
    out.push({ id: `overdue:${t.id}`, level: "important", title: `“${t.title}” was due ${t.dueDate}`, detail: "Do it, move it, or let it go.", href: `/today#task-${t.id}` });
  } else if (overdue.length > 1) {
    out.push({
      id: "overdue",
      level: "important",
      title: `${overdue.length} tasks are past their due date`,
      detail: i.recoveryMode ? "Only high-priority ones are shown. Moving them is fine." : "Moving dates is a legitimate choice.",
      href: "/today",
    });
  }

  if (i.pendingCaptures > 0) {
    out.push({ id: "captures", level: "info", title: `${i.pendingCaptures} capture${i.pendingCaptures > 1 ? "s" : ""} waiting to be filed`, href: "/#inbox" });
  }

  // Patterns are hidden in recovery mode: they are not urgent and can add pressure.
  if (i.recoveryMode) return out;

  if (i.plannedMinutesToday > 8 * 60) {
    out.push({
      id: "overplanned",
      level: "observation",
      title: `Today's plan adds up to ${Math.round(i.plannedMinutesToday / 60)} hours`,
      detail: "That may be more than the day holds. Is anything optional?",
      href: "/today",
    });
  }
  for (const t of i.postponedTasks.filter((t) => t.postponedCount >= POSTPONE_THRESHOLD).slice(0, 2)) {
    out.push({
      id: `postponed:${t.id}`,
      level: "observation",
      title: `“${t.title}” has been postponed ${t.postponedCount} times`,
      detail: "It might be blocked, unclear, or simply not important. Worth a look?",
      href: `/today#task-${t.id}`,
    });
  }
  if (i.activeProjectCount > ACTIVE_PROJECT_SOFT_LIMIT) {
    out.push({
      id: "projects",
      level: "observation",
      title: `${i.activeProjectCount} projects are active at once`,
      detail: "Pausing some is not failing at them.",
      href: "/projects",
    });
  }
  for (const g of i.goalsWithoutNextStep.filter((g) => g.priority === 1).slice(0, 2)) {
    out.push({
      id: `goal:${g.id}`,
      level: "observation",
      title: `“${g.title}” has no next step`,
      detail: "A high-priority goal with no task or project linked to it.",
      href: `/life/goals#goal-${g.id}`,
    });
  }
  return out;
}
