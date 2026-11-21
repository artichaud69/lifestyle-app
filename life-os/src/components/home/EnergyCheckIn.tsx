"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { cn } from "@/lib/utils";

const LEVELS = [
  ["LOW", "Low"],
  ["MODERATE", "Moderate"],
  ["HIGH", "High"],
] as const;

/** Optional, one tap, no streaks. Used to shape suggestions, never to score. */
export function EnergyCheckIn({ date, value }: { date: string; value: "LOW" | "MODERATE" | "HIGH" | null }) {
  const [current, setCurrent] = useState(value);
  const router = useRouter();
  return (
    <div className="flex items-center gap-2" role="radiogroup" aria-label="Energy today">
      <span className="text-xs text-muted">Energy</span>
      {LEVELS.map(([k, l]) => (
        <button
          key={k}
          role="radio"
          aria-checked={current === k}
          onClick={async () => {
            const next = current === k ? null : k;
            setCurrent(next);
            await api(`/api/v1/plans/${date}`, { method: "PATCH", body: { energy: next } });
            router.refresh();
          }}
          className={cn("rounded-full border px-2.5 py-0.5 text-xs", current === k ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:text-text")}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
