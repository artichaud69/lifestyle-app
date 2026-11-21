"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useMutate } from "@/lib/client/useMutate";
import { InlineText } from "@/components/ui/InlineText";
import { Badge, Button, Card, CardTitle, EmptyState, Input, Select } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Project = {
  id: string;
  title: string;
  purpose: string | null;
  nextAction: string | null;
  kind: string;
  status: "IDEA" | "ACTIVE" | "PAUSED" | "DONE" | "DROPPED";
  goal: { id: string; title: string } | null;
  _count: { tasks: number };
};
type Curiosity = { id: string; question: string; theme: string | null; status: "OPEN" | "EXPLORING" | "ANSWERED" | "PARKED" };

const COLUMNS = [
  ["ACTIVE", "Active"],
  ["IDEA", "Ideas"],
  ["PAUSED", "Paused"],
] as const;
const KINDS = ["PERSONAL", "LEARNING", "CREATIVE", "RECREATION", "HOME", "WORK"];

export function ProjectsView({ projects, curiosity, goals }: { projects: Project[]; curiosity: Curiosity[]; goals: Array<{ id: string; title: string }> }) {
  const call = useMutate();
  const [title, setTitle] = useState("");
  const finished = projects.filter((p) => p.status === "DONE" || p.status === "DROPPED");

  return (
    <div className="space-y-8">
      <form
        className="flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          if (title.trim() && (await call("/api/v1/projects", "POST", { title: title.trim(), status: "IDEA" }))) setTitle("");
        }}
      >
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="A project idea…" aria-label="New project" maxLength={300} />
        <Button type="submit" variant="primary">Add idea</Button>
      </form>

      <div className="grid gap-6 lg:grid-cols-3">
        {COLUMNS.map(([status, label]) => {
          const items = projects.filter((p) => p.status === status);
          return (
            <section key={status} aria-label={label}>
              <h2 className="mb-2 text-sm font-semibold">
                {label} <span className="font-normal text-faint">{items.length}</span>
              </h2>
              {status === "ACTIVE" && items.length > 5 && <p className="mb-2 text-xs text-muted">Many active projects. Pausing some isn&apos;t failing at them.</p>}
              <div className="space-y-2">
                {items.map((p) => (
                  <ProjectCard key={p.id} project={p} goals={goals} />
                ))}
                {items.length === 0 && <p className="text-xs text-faint">None.</p>}
              </div>
            </section>
          );
        })}
      </div>

      {finished.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-muted">Finished and dropped ({finished.length})</summary>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {finished.map((p) => (
              <ProjectCard key={p.id} project={p} goals={goals} />
            ))}
          </div>
        </details>
      )}

      <Card aria-label="Curiosity inbox" id="curiosity">
        <CardTitle hint="Questions you wanted to explore some day. Capture “How did…?” from the home screen.">Curiosity inbox</CardTitle>
        {curiosity.length === 0 ? (
          <EmptyState title="No open questions" />
        ) : (
          <ul className="divide-y divide-border">
            {curiosity.map((c) => (
              <li key={c.id} id={`curiosity-${c.id}`} className="group flex items-center gap-3 py-2">
                <InlineText value={c.question} ariaLabel="question" onSave={(question) => call(`/api/v1/curiosity/${c.id}`, "PATCH", { question }).then(() => undefined)} className={cn("flex-1 text-sm", c.status === "ANSWERED" && "text-faint")} />
                <Select value={c.status} onChange={(e) => call(`/api/v1/curiosity/${c.id}`, "PATCH", { status: e.target.value })} aria-label="Status" className="h-7 w-32 text-xs">
                  <option value="OPEN">Open</option>
                  <option value="EXPLORING">Exploring</option>
                  <option value="ANSWERED">Answered</option>
                  <option value="PARKED">Parked</option>
                </Select>
                <button onClick={() => call(`/api/v1/curiosity/${c.id}`, "DELETE")} aria-label="Delete question" className="text-faint opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-important">
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function ProjectCard({ project: p, goals }: { project: Project; goals: Array<{ id: string; title: string }> }) {
  const call = useMutate();
  const patch = (body: unknown) => call(`/api/v1/projects/${p.id}`, "PATCH", body).then(() => undefined);
  return (
    <article id={`project-${p.id}`} className="group rounded-xl border border-border bg-surface p-3">
      <div className="flex items-start gap-2">
        <InlineText value={p.title} ariaLabel="project title" onSave={(title) => patch({ title })} className="flex-1 text-sm font-medium" />
        <button onClick={() => call(`/api/v1/projects/${p.id}`, "DELETE")} aria-label={`Archive project “${p.title}”`} className="text-faint opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-important">
          <Trash2 size={14} />
        </button>
      </div>
      <InlineText value={p.purpose ?? "Why this project?"} ariaLabel="purpose" onSave={(purpose) => patch({ purpose })} className={cn("mt-1 text-xs", p.purpose ? "text-muted" : "text-faint")} />
      <div className="mt-2 text-xs">
        <span className="text-faint">Next: </span>
        <InlineText value={p.nextAction ?? "—"} ariaLabel="next action" onSave={(nextAction) => patch({ nextAction })} className="text-xs" />
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <Select value={p.status} onChange={(e) => patch({ status: e.target.value })} aria-label="Status" className="h-7 w-auto text-xs">
          <option value="IDEA">Idea</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="DONE">Done</option>
          <option value="DROPPED">Dropped</option>
        </Select>
        <Select value={p.kind} onChange={(e) => patch({ kind: e.target.value })} aria-label="Kind" className="h-7 w-auto text-xs">
          {KINDS.map((k) => (
            <option key={k} value={k}>{k[0] + k.slice(1).toLowerCase()}</option>
          ))}
        </Select>
        {goals.length > 0 && (
          <Select value={p.goal?.id ?? ""} onChange={(e) => patch({ goalId: e.target.value || null })} aria-label="Supports goal" className="h-7 w-auto max-w-40 text-xs">
            <option value="">No goal</option>
            {goals.map((g) => (
              <option key={g.id} value={g.id}>{g.title}</option>
            ))}
          </Select>
        )}
        {p._count.tasks > 0 && <Badge>{p._count.tasks} open</Badge>}
      </div>
    </article>
  );
}
