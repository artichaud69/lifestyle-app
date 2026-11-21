import Link from "next/link";
import { Suspense } from "react";
import { requirePageUser } from "@/server/auth/current";
import { getDashboard } from "@/server/modules/dashboard/service";
import { formatDateKey, dateToKey } from "@/lib/dates";
import { Badge, Card, CardTitle, EmptyState } from "@/components/ui/primitives";
import { QuickCapture } from "@/components/capture/QuickCapture";
import { TaskRow } from "@/components/tasks/TaskRow";
import { CaptureInbox } from "@/components/home/CaptureInbox";
import { EnergyCheckIn } from "@/components/home/EnergyCheckIn";
import { DomainStatus } from "@/components/home/DomainStatus";
import { cn } from "@/lib/utils";

export const metadata = { title: "Home" };

const PLAN_KIND_LABEL = { MAIN: "Main focus", OPTIONAL: "If there's room", COMMITMENT: "Commitment", LEISURE: "Chosen leisure", RECOVERY: "Recovery" } as const;

export default async function HomePage() {
  const user = await requirePageUser();
  const d = await getDashboard(user.id);
  const mode = d.settings.interfaceMode;
  const recovery = d.settings.recoveryMode;
  const main = d.plan.items.find((i) => i.kind === "MAIN");
  const others = d.plan.items.filter((i) => i.kind !== "MAIN");

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <header>
          <p className="text-sm text-muted">{formatDateKey(d.today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {recovery ? `Take it gently today, ${user.displayName}.` : `Good to see you, ${user.displayName}.`}
          </h1>
          {recovery && <p className="mt-1 text-sm text-muted">Recovery mode is on: only what matters is shown, and moving things is always fine.</p>}
        </header>

        <Suspense>
          <QuickCapture today={d.today} />
        </Suspense>

        <Card aria-label="Today">
          <CardTitle
            hint={d.plan.intention ? `Intention: ${d.plan.intention}` : undefined}
            action={
              <Link href="/today" className="text-xs text-accent hover:underline">
                Plan the day
              </Link>
            }
          >
            Today
          </CardTitle>
          <div className="mb-4">
            <EnergyCheckIn date={d.today} value={d.plan.energy} />
            {d.plan.energy === "LOW" && !recovery && (
              <p className="mt-2 text-xs text-muted">Low energy: a good day for simple tasks or rest. Optional items can wait.</p>
            )}
          </div>
          {main ? (
            <div className="mb-3 rounded-xl bg-accent-soft px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-accent">Main focus</p>
              <p className={cn("text-sm", main.doneAt && "line-through opacity-60")}>{main.label}</p>
            </div>
          ) : (
            <p className="mb-3 text-sm text-muted">
              No main focus chosen. <Link href="/today" className="text-accent hover:underline">Pick one</Link> — or don&apos;t; some days don&apos;t need one.
            </p>
          )}
          {others.length > 0 && (
            <ul className="mb-3 space-y-1">
              {others.map((i) => (
                <li key={i.id} className="flex items-center gap-2 text-sm">
                  <Badge tone={i.kind === "LEISURE" ? "leisure" : i.kind === "RECOVERY" ? "ok" : "neutral"}>{PLAN_KIND_LABEL[i.kind]}</Badge>
                  <span className={cn(i.doneAt && "text-faint line-through")}>{i.label}</span>
                  {i.minutes && <span className="text-xs text-faint">{i.minutes} min</span>}
                </li>
              ))}
            </ul>
          )}
          <h3 className="mb-1 mt-4 text-xs font-medium text-muted">Due today{d.dueTasks.some((t) => t.dueDate && dateToKey(t.dueDate) < d.today) ? " and earlier" : ""}</h3>
          {d.dueTasks.length ? (
            <ul>
              {d.dueTasks.map((t) => (
                <TaskRow key={t.id} task={t} today={d.today} compact={mode === "MINIMAL"} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-faint">Nothing due. </p>
          )}
        </Card>

        {mode !== "MINIMAL" && (
          <Card aria-label="Life overview">
            <CardTitle hint="How each part of life feels to you. Set it yourself; nothing here is calculated.">Life overview</CardTitle>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {d.domains.map((dm) => (
                <DomainStatus key={dm.id} id={dm.id} name={dm.name} status={dm.status} activeGoals={dm.activeGoals} compact={recovery} />
              ))}
            </div>
          </Card>
        )}

        {mode === "ANALYTICAL" && !recovery && (
          <Card aria-label="This week in numbers">
            <CardTitle hint="Counts only — what they mean is up to you.">At a glance</CardTitle>
            <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Active goals" value={d.goals.length} />
              <Stat label="Active projects" value={d.activeProjects.length} />
              <Stat label="Due in 7 days" value={d.upcoming.length} />
              <Stat label="Journal entries (7d)" value={d.recentJournalCount} />
            </dl>
          </Card>
        )}
      </div>

      <aside className="space-y-6" aria-label="Context">
        <Card aria-label="Attention">
          <CardTitle>Attention</CardTitle>
          {d.attention.length ? (
            <ul className="space-y-2.5">
              {d.attention.map((a) => (
                <li key={a.id}>
                  <Link href={a.href ?? "#"} className="block rounded-lg hover:bg-surface-2 -mx-1 px-1 py-0.5">
                    <span className="flex items-start gap-2">
                      <span
                        className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", a.level === "important" ? "bg-important" : a.level === "observation" ? "bg-accent" : "bg-faint")}
                        aria-label={a.level}
                      />
                      <span>
                        <span className="block text-sm">{a.title}</span>
                        {a.detail && <span className="block text-xs text-muted">{a.detail}</span>}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-faint">Nothing needs your attention right now.</p>
          )}
        </Card>

        <Card aria-label="Inbox" id="inbox">
          <CardTitle>Inbox</CardTitle>
          <CaptureInbox captures={d.pending} today={d.today} />
        </Card>

        {mode !== "MINIMAL" && (
          <Card aria-label="Coming up">
            <CardTitle>Next 7 days</CardTitle>
            {d.upcoming.length ? (
              <ul className="space-y-1.5">
                {d.upcoming.map((t) => (
                  <li key={t.id} className="flex justify-between gap-2 text-sm">
                    <span className="truncate">{t.title}</span>
                    <span className="shrink-0 text-xs text-faint">{formatDateKey(dateToKey(t.dueDate!))}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="A clear week">Tasks with due dates in the next seven days show here.</EmptyState>
            )}
          </Card>
        )}

        {mode !== "MINIMAL" && !recovery && d.goals.length > 0 && (
          <Card aria-label="Active goals">
            <CardTitle action={<Link href="/life/goals" className="text-xs text-accent hover:underline">All goals</Link>}>Active goals</CardTitle>
            <ul className="space-y-1.5">
              {d.goals.slice(0, 5).map((g) => (
                <li key={g.id} className="text-sm">
                  <Link href={`/life/goals#goal-${g.id}`} className="hover:underline">
                    {g.title}
                  </Link>
                  {g.domain && <span className="ml-1.5 text-xs text-faint">{g.domain.name}</span>}
                </li>
              ))}
            </ul>
          </Card>
        )}

        <Card aria-label="Advisor">
          <CardTitle>Advisor</CardTitle>
          <p className="text-sm text-muted">Ask about your week, a decision, or a pattern. Answers are grounded in your own records, and you can see which ones.</p>
          <Link href="/advisor" className="mt-3 inline-block text-sm text-accent hover:underline">
            Open the advisor →
          </Link>
        </Card>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}
