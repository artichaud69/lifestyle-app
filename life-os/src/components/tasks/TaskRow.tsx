"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { InlineText } from "@/components/ui/InlineText";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export type TaskDTO = {
  id: string;
  title: string;
  status: "TODO" | "DONE" | "CANCELLED";
  dueDate: Date | string | null;
  priority: number;
  estimateMinutes: number | null;
  postponedCount: number;
  project?: { id: string; title: string } | null;
};

const key = (d: Date | string | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export function TaskRow({ task, today, compact }: { task: TaskDTO; today: string; compact?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [done, setDone] = useState(task.status === "DONE");
  const due = key(task.dueDate);
  const overdue = !done && due && due < today;

  async function patch(body: Record<string, unknown>) {
    try {
      await api(`/api/v1/tasks/${task.id}`, { method: "PATCH", body });
      router.refresh();
    } catch (e) {
      toast({ message: e instanceof Error ? e.message : "Could not update", tone: "error" });
      throw e;
    }
  }

  async function toggle() {
    const next = !done;
    setDone(next); // optimistic
    try {
      await patch({ status: next ? "DONE" : "TODO" });
    } catch {
      setDone(!next);
    }
  }

  async function remove() {
    await api(`/api/v1/tasks/${task.id}`, { method: "DELETE" });
    router.refresh();
    toast({
      message: "Task removed.",
      action: {
        label: "Undo",
        run: async () => {
          await api(`/api/v1/tasks/${task.id}/restore`, { body: {} });
          router.refresh();
        },
      },
    });
  }

  return (
    <li id={`task-${task.id}`} className="group flex items-start gap-3 rounded-lg px-1 py-1.5 hover:bg-surface-2/60">
      <input
        type="checkbox"
        checked={done}
        onChange={toggle}
        aria-label={`Mark “${task.title}” ${done ? "not done" : "done"}`}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-[var(--accent)]"
      />
      <div className="min-w-0 flex-1">
        <InlineText value={task.title} ariaLabel="task title" onSave={(title) => patch({ title })} className={cn("text-sm", done && "text-faint line-through")} />
        {!compact && (
          <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            {task.project && <Badge>{task.project.title}</Badge>}
            {task.priority === 1 && <Badge tone="accent">high priority</Badge>}
            {task.estimateMinutes && <span>{task.estimateMinutes} min</span>}
            {task.postponedCount >= 3 && <span className="text-faint">moved {task.postponedCount}×</span>}
          </div>
        )}
      </div>
      <input
        type="date"
        value={due}
        onChange={(e) => void patch({ dueDate: e.target.value || null })}
        aria-label={`Due date for “${task.title}”`}
        className={cn("h-7 w-[8.5rem] shrink-0 rounded-md border border-transparent bg-transparent px-1 text-xs hover:border-border", overdue ? "text-important" : "text-muted", !due && "text-faint")}
      />
      <button onClick={remove} aria-label={`Remove “${task.title}”`} className="mt-0.5 shrink-0 text-faint opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:text-important">
        <Trash2 size={14} />
      </button>
    </li>
  );
}

export function AddTask({ defaultDue, projectId, placeholder = "Add a task…" }: { defaultDue?: string; projectId?: string; placeholder?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [title, setTitle] = useState("");
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        try {
          await api("/api/v1/tasks", { body: { title: title.trim(), dueDate: defaultDue ?? null, projectId: projectId ?? null } });
          setTitle("");
          router.refresh();
        } catch (err) {
          toast({ message: err instanceof Error ? err.message : "Could not add", tone: "error" });
        }
      }}
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={placeholder}
        aria-label="New task"
        maxLength={300}
        className="h-8 w-full rounded-lg border border-dashed border-border bg-transparent px-2 text-sm placeholder:text-faint focus:border-accent focus:outline-none"
      />
    </form>
  );
}
