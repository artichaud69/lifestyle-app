"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useMutate } from "@/lib/client/useMutate";
import { InlineText } from "@/components/ui/InlineText";
import { Badge, Button, Card, EmptyState, Input, Select } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Goal = {
  id: string;
  title: string;
  motivation: string | null;
  status: "ACTIVE" | "PAUSED" | "ACHIEVED" | "RELEASED";
  priority: number;
  horizon: string;
  targetDate: Date | string | null;
  domain: { key: string; name: string } | null;
  milestones: Array<{ id: string; title: string; doneAt: Date | string | null }>;
  _count: { tasks: number; projects: number };
};

const HORIZONS = [
  ["OPEN", "No horizon"],
  ["MONTH", "This month"],
  ["QUARTER", "This quarter"],
  ["ONE_YEAR", "1 year"],
  ["FIVE_YEARS", "5 years"],
  ["TEN_YEARS", "10 years"],
] as const;

export function GoalsBoard({ goals, domains }: { goals: Goal[]; domains: Array<{ key: string; name: string }> }) {
  const call = useMutate();
  const [title, setTitle] = useState("");
  const [domainKey, setDomainKey] = useState("");
  const active = goals.filter((g) => g.status === "ACTIVE");
  const rest = goals.filter((g) => g.status !== "ACTIVE");

  return (
    <div className="space-y-6">
      <form
        className="flex flex-wrap gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (!title.trim()) return;
          if (await call("/api/v1/goals", "POST", { title: title.trim(), domainKey: domainKey || null })) setTitle("");
        }}
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A new goal…" aria-label="New goal" className="min-w-0 flex-1" maxLength={300} />
        <Select value={domainKey} onChange={(e) => setDomainKey(e.target.value)} aria-label="Life area" className="w-44">
          <option value="">Life area…</option>
          {domains.map((d) => (
            <option key={d.key} value={d.key}>{d.name}</option>
          ))}
        </Select>
        <Button type="submit" variant="primary">Add goal</Button>
      </form>
      {active.length > 7 && (
        <p className="rounded-lg bg-accent-soft px-3 py-2 text-sm text-accent">
          {active.length} goals are active at once. That can be right — or a sign some could be paused for now.
        </p>
      )}
      {goals.length === 0 && <EmptyState title="No goals yet">Add one above, or capture “I want to…” from the home screen.</EmptyState>}
      <div className="space-y-3">
        {active.map((g) => (
          <GoalCard key={g.id} goal={g} domains={domains} />
        ))}
      </div>
      {rest.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-muted">Paused, achieved and released ({rest.length})</summary>
          <div className="mt-3 space-y-3">
            {rest.map((g) => (
              <GoalCard key={g.id} goal={g} domains={domains} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function GoalCard({ goal, domains }: { goal: Goal; domains: Array<{ key: string; name: string }> }) {
  const call = useMutate();
  const [milestone, setMilestone] = useState("");
  const patch = (body: unknown) => call(`/api/v1/goals/${goal.id}`, "PATCH", body).then(() => undefined);
  return (
    <Card as="article" id={`goal-${goal.id}`} className={cn(goal.status !== "ACTIVE" && "opacity-75")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <InlineText value={goal.title} ariaLabel="goal title" onSave={(title) => patch({ title })} className="text-base font-medium" />
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <Select value={goal.domain?.key ?? ""} onChange={(e) => patch({ domainKey: e.target.value || null })} aria-label="Life area" className="h-7 w-auto text-xs">
              <option value="">No area</option>
              {domains.map((d) => (
                <option key={d.key} value={d.key}>{d.name}</option>
              ))}
            </Select>
            <Select value={goal.horizon} onChange={(e) => patch({ horizon: e.target.value })} aria-label="Horizon" className="h-7 w-auto text-xs">
              {HORIZONS.map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </Select>
            <Select value={String(goal.priority)} onChange={(e) => patch({ priority: Number(e.target.value) })} aria-label="Priority" className="h-7 w-auto text-xs">
              <option value="1">High priority</option>
              <option value="2">Normal priority</option>
              <option value="3">Low priority</option>
            </Select>
            <Select value={goal.status} onChange={(e) => patch({ status: e.target.value })} aria-label="Status" className="h-7 w-auto text-xs">
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="ACHIEVED">Achieved</option>
              <option value="RELEASED">Released</option>
            </Select>
            {(goal._count.tasks > 0 || goal._count.projects > 0) && (
              <Badge>
                {goal._count.tasks} open task{goal._count.tasks === 1 ? "" : "s"} · {goal._count.projects} project{goal._count.projects === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
        </div>
        <button aria-label={`Archive goal “${goal.title}”`} onClick={() => call(`/api/v1/goals/${goal.id}`, "DELETE")} className="text-faint hover:text-important">
          <Trash2 size={15} />
        </button>
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-muted">Why it matters</p>
        <InlineText
          multiline
          value={goal.motivation ?? "Add your reason…"}
          ariaLabel="motivation"
          onSave={(motivation) => patch({ motivation })}
          className={cn("text-sm", !goal.motivation && "text-faint")}
        />
      </div>
      <div className="mt-3">
        <p className="text-xs font-medium text-muted">Milestones</p>
        <ul className="mt-1 space-y-1">
          {goal.milestones.map((m) => (
            <li key={m.id} className="group flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!m.doneAt} onChange={() => call(`/api/v1/milestones/${m.id}`, "PATCH", { done: !m.doneAt })} aria-label={`Milestone “${m.title}” done`} className="accent-[var(--accent)]" />
              <span className={cn("flex-1", m.doneAt && "text-faint line-through")}>{m.title}</span>
              <button className="text-faint opacity-0 group-hover:opacity-100 hover:text-important" onClick={() => call(`/api/v1/milestones/${m.id}`, "DELETE")} aria-label={`Delete milestone “${m.title}”`}>
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-1"
          onSubmit={async (e) => {
            e.preventDefault();
            if (!milestone.trim()) return;
            if (await call(`/api/v1/goals/${goal.id}/milestones`, "POST", { title: milestone.trim() })) setMilestone("");
          }}
        >
          <input value={milestone} onChange={(e) => setMilestone(e.target.value)} placeholder="Add a milestone…" aria-label="New milestone" className="h-7 w-full rounded-md border border-dashed border-border bg-transparent px-2 text-xs placeholder:text-faint" />
        </form>
      </div>
    </Card>
  );
}
