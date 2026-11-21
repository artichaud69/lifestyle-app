import { requirePageUser } from "@/server/auth/current";
import { getSettings } from "@/server/modules/settings/service";
import { getOrCreatePlan } from "@/server/modules/planning/service";
import { listTasks } from "@/server/modules/tasks/service";
import { addDays, formatDateKey, isDateKey, localDateKey } from "@/lib/dates";
import { Card, CardTitle, PageHeader } from "@/components/ui/primitives";
import { TaskRow, AddTask } from "@/components/tasks/TaskRow";
import { DayPlanner } from "@/components/today/DayPlanner";
import Link from "next/link";

export const metadata = { title: "Today" };

export default async function TodayPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const user = await requirePageUser();
  const settings = await getSettings(user.id);
  const today = localDateKey(settings.timezone);
  const sp = await searchParams;
  const date = sp.date && isDateKey(sp.date) ? sp.date : today;
  const [plan, open, done] = await Promise.all([
    getOrCreatePlan(user.id, date),
    listTasks(user.id, { status: "TODO" }),
    listTasks(user.id, { status: "DONE", take: 10 }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={date === today ? "Today" : formatDateKey(date, { weekday: "long", day: "numeric", month: "long" })}
        subtitle={
          <span className="flex gap-3">
            <Link className="hover:text-text" href={`/today?date=${addDays(date, -1)}`}>← Previous day</Link>
            {date !== today && <Link className="hover:text-text" href="/today">Today</Link>}
            <Link className="hover:text-text" href={`/today?date=${addDays(date, 1)}`}>Next day →</Link>
          </span>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <DayPlanner
          date={date}
          plan={plan}
          recoveryMode={settings.recoveryMode}
          tasks={open.map((t) => ({ id: t.id, title: t.title }))}
        />
        <Card aria-label="Tasks">
          <CardTitle hint="Everything still open. Tick, rename, re-date or remove inline.">Open tasks</CardTitle>
          <AddTask defaultDue={date} />
          <ul className="mt-2">
            {open.map((t) => (
              <TaskRow key={t.id} task={t} today={today} />
            ))}
          </ul>
          {open.length === 0 && <p className="mt-2 text-sm text-faint">No open tasks.</p>}
          {done.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer text-xs text-muted">Recently completed ({done.length})</summary>
              <ul className="mt-1">
                {done.map((t) => (
                  <TaskRow key={t.id} task={t} today={today} compact />
                ))}
              </ul>
            </details>
          )}
        </Card>
      </div>
    </div>
  );
}
