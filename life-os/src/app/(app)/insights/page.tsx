import { requirePageUser } from "@/server/auth/current";
import { getWeekSummary } from "@/server/modules/dashboard/weekly";
import { formatDateKey } from "@/lib/dates";
import { Card, CardTitle, EmptyState, PageHeader } from "@/components/ui/primitives";
import Link from "next/link";

export const metadata = { title: "Insights" };

export default async function InsightsPage() {
  const user = await requirePageUser();
  const w = await getWeekSummary(user.id);
  const empty = !w.completed.length && !w.journalEntries && !w.mainFocus.planned && !w.leisure.planned;
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="This week"
        subtitle={`${formatDateKey(w.start)} – ${formatDateKey(w.end)}. What your records show — counts, not judgements.`}
      />
      {empty ? (
        <EmptyState title="Not much recorded this week yet">As you plan days, complete tasks and journal, a factual summary builds up here.</EmptyState>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardTitle hint="Main focus items you set on daily plans.">Intention vs. what happened</CardTitle>
            {w.mainFocus.planned ? (
              <ul className="space-y-1 text-sm">
                {w.mainFocus.labels.map((m, i) => (
                  <li key={i} className={m.done ? "" : "text-muted"}>
                    {m.done ? "✓" : "○"} {m.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-faint">No main focus set this week.</p>
            )}
          </Card>
          <Card>
            <CardTitle hint="Time you deliberately kept for enjoyment and rest.">Leisure & recovery</CardTitle>
            <p className="text-sm">
              {w.leisure.planned} leisure block{w.leisure.planned === 1 ? "" : "s"}
              {w.leisure.minutes ? ` (${Math.round(w.leisure.minutes / 60)} h)` : ""}, {w.recovery} recovery block{w.recovery === 1 ? "" : "s"}.
            </p>
            {w.leisure.aligned + w.leisure.notAligned > 0 && (
              <p className="mt-1 text-sm text-muted">
                Afterwards, you said {w.leisure.aligned} felt how you wanted and {w.leisure.notAligned} not quite.
              </p>
            )}
          </Card>
          <Card>
            <CardTitle>Completed</CardTitle>
            {w.completed.length ? (
              <ul className="space-y-1 text-sm">
                {w.completed.slice(0, 12).map((t) => (
                  <li key={t.id}>
                    {t.title} {t.project && <span className="text-xs text-faint">· {t.project.title}</span>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-faint">Nothing marked done — which may be exactly right for this week.</p>
            )}
            <p className="mt-2 text-xs text-faint">{w.createdTasks} tasks added this week.</p>
          </Card>
          <Card>
            <CardTitle>Reflection</CardTitle>
            <p className="text-sm">
              {w.journalEntries} journal entr{w.journalEntries === 1 ? "y" : "ies"}, {w.captures} capture{w.captures === 1 ? "" : "s"}.
            </p>
            <p className="mt-3 text-sm text-muted">What would you like to carry into next week?</p>
            <Link href="/life/journal#new" className="mt-1 inline-block text-sm text-accent hover:underline">Write it down →</Link>
          </Card>
        </div>
      )}
      <p className="mt-8 text-xs text-faint">
        Pattern detection, evidence-linked AI weekly reviews and personal experiments are planned for Phase 2 and need more history before they can say anything reliable.
      </p>
    </div>
  );
}
