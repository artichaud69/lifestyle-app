"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { Badge, Button, Card, CardTitle, Input, Select } from "@/components/ui/primitives";
import { EnergyCheckIn } from "@/components/home/EnergyCheckIn";
import { cn } from "@/lib/utils";

type Kind = "MAIN" | "OPTIONAL" | "COMMITMENT" | "LEISURE" | "RECOVERY";
type Item = { id: string; kind: Kind; label: string; minutes: number | null; doneAt: Date | string | null; aligned: boolean | null; taskId: string | null };
type Plan = { intention: string | null; energy: "LOW" | "MODERATE" | "HIGH" | null; items: Item[] };

const SECTIONS: Array<{ kind: Kind; title: string; hint: string; tone: "accent" | "neutral" | "leisure" | "ok" }> = [
  { kind: "MAIN", title: "Main focus", hint: "One thing that would make today feel well spent.", tone: "accent" },
  { kind: "OPTIONAL", title: "If there's room", hint: "Up to three. Fine if they don't happen.", tone: "neutral" },
  { kind: "COMMITMENT", title: "Commitments", hint: "Fixed things: appointments, pick-ups, meetings.", tone: "neutral" },
  { kind: "LEISURE", title: "Chosen leisure", hint: "Time you're deliberately keeping for enjoyment.", tone: "leisure" },
  { kind: "RECOVERY", title: "Recovery", hint: "Rest, a walk, nothing at all.", tone: "ok" },
];

export function DayPlanner({ date, plan, tasks, recoveryMode }: { date: string; plan: Plan; tasks: Array<{ id: string; title: string }>; recoveryMode: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [intention, setIntention] = useState(plan.intention ?? "");

  async function call(path: string, method: string, body?: unknown) {
    try {
      await api(path, { method, body });
      router.refresh();
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Could not save", tone: "error" });
    }
  }

  const sections = recoveryMode ? [SECTIONS[4]!, SECTIONS[2]!, SECTIONS[0]!, SECTIONS[3]!] : SECTIONS;
  const totalMinutes = plan.items.reduce((s, i) => s + (i.minutes ?? 0), 0);

  return (
    <Card aria-label="Day plan">
      <CardTitle hint={totalMinutes ? `${Math.round((totalMinutes / 60) * 10) / 10} h planned in total — unplanned time is part of the plan.` : "Leave space unplanned. That's part of the plan."}>
        Plan
      </CardTitle>
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void call(`/api/v1/plans/${date}`, "PATCH", { intention: intention.trim() || null });
          }}
        >
          <Input value={intention} onChange={(e) => setIntention(e.target.value)} onBlur={() => intention !== (plan.intention ?? "") && call(`/api/v1/plans/${date}`, "PATCH", { intention: intention.trim() || null })} placeholder="Intention for the day (optional)" aria-label="Intention" maxLength={500} />
        </form>
        <EnergyCheckIn date={date} value={plan.energy} />
      </div>

      <div className="mt-5 space-y-5">
        {sections.map((s) => {
          const items = plan.items.filter((i) => i.kind === s.kind);
          return (
            <section key={s.kind} aria-label={s.title}>
              <div className="mb-1.5 flex items-baseline justify-between">
                <h3 className="text-xs font-semibold text-text">{s.title}</h3>
                <span className="text-[11px] text-faint">{s.hint}</span>
              </div>
              <ul className="space-y-1">
                {items.map((i) => (
                  <li key={i.id} className="group flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-surface-2/60">
                    <input
                      type="checkbox"
                      checked={!!i.doneAt}
                      onChange={() => call(`/api/v1/plan-items/${i.id}`, "PATCH", { done: !i.doneAt })}
                      aria-label={`Mark “${i.label}” ${i.doneAt ? "not done" : "done"}`}
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                    <span className={cn("flex-1 text-sm", i.doneAt && "text-faint line-through")}>{i.label}</span>
                    {i.minutes && <Badge tone={s.tone}>{i.minutes} min</Badge>}
                    {i.kind === "LEISURE" && i.doneAt && i.aligned === null && (
                      <span className="flex items-center gap-1 text-[11px] text-muted">
                        How you wanted to spend it?
                        <button className="rounded px-1 hover:bg-surface-2" onClick={() => call(`/api/v1/plan-items/${i.id}`, "PATCH", { aligned: true })}>Yes</button>
                        <button className="rounded px-1 hover:bg-surface-2" onClick={() => call(`/api/v1/plan-items/${i.id}`, "PATCH", { aligned: false })}>Not quite</button>
                      </span>
                    )}
                    {i.aligned !== null && <span className="text-[11px] text-faint">{i.aligned ? "as intended" : "not quite"}</span>}
                    <button onClick={() => call(`/api/v1/plan-items/${i.id}`, "DELETE")} aria-label={`Remove “${i.label}” from plan`} className="text-faint opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-important">
                      <X size={14} />
                    </button>
                  </li>
                ))}
              </ul>
              <AddItem kind={s.kind} tasks={s.kind === "MAIN" || s.kind === "OPTIONAL" ? tasks : []} onAdd={(body) => call(`/api/v1/plans/${date}/items`, "POST", body)} />
            </section>
          );
        })}
      </div>
    </Card>
  );
}

function AddItem({ kind, tasks, onAdd }: { kind: Kind; tasks: Array<{ id: string; title: string }>; onAdd: (body: unknown) => Promise<void> }) {
  const [label, setLabel] = useState("");
  const [minutes, setMinutes] = useState("");
  const [taskId, setTaskId] = useState("");
  return (
    <form
      className="mt-1 flex gap-1.5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!label.trim() && !taskId) return;
        await onAdd({ kind, label: label.trim() || undefined, taskId: taskId || null, minutes: minutes ? Number(minutes) : null });
        setLabel("");
        setMinutes("");
        setTaskId("");
      }}
    >
      {tasks.length > 0 && (
        <Select value={taskId} onChange={(e) => setTaskId(e.target.value)} aria-label={`Pick a task for ${kind.toLowerCase()}`} className="h-8 w-36 text-xs">
          <option value="">From tasks…</option>
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.title}
            </option>
          ))}
        </Select>
      )}
      <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder={kind === "LEISURE" ? "e.g. Minecraft with no guilt" : "Add…"} aria-label={`Add to ${kind.toLowerCase()}`} className="h-8 text-xs" maxLength={200} />
      <Input value={minutes} onChange={(e) => setMinutes(e.target.value)} type="number" min={5} placeholder="min" aria-label="Minutes" className="h-8 w-16 text-xs" />
      <Button size="sm" type="submit">Add</Button>
    </form>
  );
}
