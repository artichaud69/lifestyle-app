"use client";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { cn } from "@/lib/utils";

export const STATUS_LABEL = {
  UNSET: "Not reflected on",
  THRIVING: "Thriving",
  STEADY: "Steady",
  NEEDS_ATTENTION: "Needs attention",
  RESTING: "Resting by choice",
} as const;

const TONE: Record<keyof typeof STATUS_LABEL, string> = {
  UNSET: "bg-border",
  THRIVING: "bg-ok",
  STEADY: "bg-accent",
  NEEDS_ATTENTION: "bg-important",
  RESTING: "bg-leisure",
};

/** Qualitative, self-reported status for a life domain — deliberately not a score. */
export function DomainStatus({ id, name, status, activeGoals, compact }: { id: string; name: string; status: keyof typeof STATUS_LABEL; activeGoals: number; compact?: boolean }) {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className={cn("h-2 w-2 shrink-0 rounded-full", TONE[status])} aria-hidden />
        <span className="truncate text-sm">{name}</span>
        {!compact && activeGoals > 0 && <span className="whitespace-nowrap text-xs text-faint">{activeGoals} goal{activeGoals > 1 ? "s" : ""}</span>}
      </div>
      <select
        value={status}
        aria-label={`How is ${name}?`}
        onChange={async (e) => {
          await api(`/api/v1/domains/${id}`, { method: "PATCH", body: { status: e.target.value } });
          router.refresh();
        }}
        className="h-7 rounded-md border border-transparent bg-transparent text-xs text-muted hover:border-border"
      >
        {Object.entries(STATUS_LABEL).map(([k, l]) => (
          <option key={k} value={k}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );
}
