"use client";
import { useState } from "react";
import { Check, EyeOff, HelpCircle, Trash2, X } from "lucide-react";
import { api } from "@/lib/client/api";
import { useMutate } from "@/lib/client/useMutate";
import { InlineText } from "@/components/ui/InlineText";
import { Badge, Button, Card, EmptyState, Input, Select } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Memory = {
  id: string;
  layer: "PROFILE" | "EPISODIC" | "WORKING" | "REFLECTIVE";
  status: "USER_STATED" | "IMPORTED" | "AI_INFERENCE" | "USER_CONFIRMED" | "SPECULATIVE" | "REJECTED";
  content: string;
  confidence: number;
  excludedFromAi: boolean;
  sensitivity: string;
  createdAt: Date | string;
  lastVerifiedAt: Date | string | null;
  sourceCount: number;
};

const LAYERS = [
  ["PROFILE", "About you", "Lasting values, preferences and interests."],
  ["WORKING", "Current situation", "Priorities and ongoing circumstances."],
  ["EPISODIC", "Experiences", "Events and decisions worth remembering."],
  ["REFLECTIVE", "Patterns & hypotheses", "Tentative interpretations — always open to correction."],
] as const;

const STATUS: Record<Memory["status"], { label: string; tone: "neutral" | "accent" | "ok" | "important" | "leisure" }> = {
  USER_STATED: { label: "You said", tone: "ok" },
  USER_CONFIRMED: { label: "You confirmed", tone: "ok" },
  IMPORTED: { label: "Imported", tone: "neutral" },
  AI_INFERENCE: { label: "AI inference", tone: "accent" },
  SPECULATIVE: { label: "Hypothesis", tone: "leisure" },
  REJECTED: { label: "Marked inaccurate", tone: "important" },
};

type Explained = { sources: Array<{ id: string; sourceType: string; label: string; excerpt: string | null; createdAt: string }> };

export function MemoryView({ memories }: { memories: Memory[] }) {
  const call = useMutate();
  const [content, setContent] = useState("");
  const [layer, setLayer] = useState<Memory["layer"]>("PROFILE");
  const live = memories.filter((m) => m.status !== "REJECTED");
  const rejected = memories.filter((m) => m.status === "REJECTED");

  return (
    <div className="space-y-6">
      <Card aria-label="Add memory">
        <form
          className="flex flex-wrap gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (content.trim() && (await call("/api/v1/memories", "POST", { content: content.trim(), layer }))) setContent("");
          }}
        >
          <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="Tell LIFE OS something about yourself…" aria-label="New memory" className="min-w-0 flex-1" maxLength={2000} />
          <Select value={layer} onChange={(e) => setLayer(e.target.value as Memory["layer"])} aria-label="Kind of memory" className="w-48">
            {LAYERS.filter(([k]) => k !== "REFLECTIVE").map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </Select>
          <Button type="submit" variant="primary">Remember</Button>
        </form>
      </Card>

      {live.length === 0 && <EmptyState title="Nothing remembered yet">Statements like “I work best in the morning” captured from the home screen appear here.</EmptyState>}
      {LAYERS.map(([key, title, hint]) => {
        const items = live.filter((m) => m.layer === key);
        if (!items.length) return null;
        return (
          <section key={key} aria-label={title}>
            <h2 className="text-sm font-semibold">{title}</h2>
            <p className="mb-2 text-xs text-muted">{hint}</p>
            <ul className="space-y-2">
              {items.map((m) => (
                <MemoryItem key={m.id} memory={m} />
              ))}
            </ul>
          </section>
        );
      })}

      {rejected.length > 0 && (
        <details>
          <summary className="cursor-pointer text-sm text-muted">Marked inaccurate ({rejected.length}) — kept so they aren&apos;t suggested again, never used by the AI</summary>
          <ul className="mt-2 space-y-2">
            {rejected.map((m) => (
              <MemoryItem key={m.id} memory={m} />
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

function MemoryItem({ memory: m }: { memory: Memory }) {
  const call = useMutate();
  const [why, setWhy] = useState<Explained | null>(null);
  const status = STATUS[m.status];
  const isInference = m.status === "AI_INFERENCE" || m.status === "SPECULATIVE";
  return (
    <li id={`memory-${m.id}`} className={cn("rounded-xl border border-border bg-surface px-4 py-3", m.status === "REJECTED" && "opacity-60")}>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <InlineText value={m.content} ariaLabel="memory" onSave={(content) => call(`/api/v1/memories/${m.id}`, "PATCH", { content }).then(() => undefined)} className="text-sm" />
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge tone={status.tone}>{status.label}</Badge>
            {isInference && <span className="text-[11px] text-faint">confidence {Math.round(m.confidence * 100)}%</span>}
            {m.excludedFromAi && m.status !== "REJECTED" && <Badge>hidden from AI</Badge>}
            <span className="text-[11px] text-faint">added {new Date(m.createdAt).toLocaleDateString("en-GB")}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-faint">
          <IconBtn label="Why do you believe this?" onClick={async () => setWhy(why ? null : (await api<{ memory: Explained }>(`/api/v1/memories/${m.id}`)).memory)}>
            <HelpCircle size={15} />
          </IconBtn>
          {isInference && (
            <IconBtn label="Confirm — this is accurate" onClick={() => call(`/api/v1/memories/${m.id}`, "PATCH", { verdict: "confirm" })}>
              <Check size={15} />
            </IconBtn>
          )}
          {m.status !== "REJECTED" && (
            <>
              <IconBtn label="Not accurate" onClick={() => call(`/api/v1/memories/${m.id}`, "PATCH", { verdict: "reject" })}>
                <X size={15} />
              </IconBtn>
              <IconBtn label={m.excludedFromAi ? "Allow the AI to use this" : "Keep, but don't use with AI"} pressed={m.excludedFromAi} onClick={() => call(`/api/v1/memories/${m.id}`, "PATCH", { excludedFromAi: !m.excludedFromAi })}>
                <EyeOff size={15} />
              </IconBtn>
            </>
          )}
          <IconBtn label="Delete" danger onClick={() => call(`/api/v1/memories/${m.id}`, "DELETE")}>
            <Trash2 size={15} />
          </IconBtn>
        </div>
      </div>
      {why && (
        <div className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-xs text-muted">
          <p className="font-medium text-text">Where this came from</p>
          <ul className="mt-1 list-disc pl-4">
            {why.sources.map((s) => (
              <li key={s.id}>{s.label}</li>
            ))}
            {why.sources.length === 0 && <li>No recorded source.</li>}
          </ul>
        </div>
      )}
    </li>
  );
}

function IconBtn({ label, onClick, children, danger, pressed }: { label: string; onClick: () => unknown; children: React.ReactNode; danger?: boolean; pressed?: boolean }) {
  return (
    <button title={label} aria-label={label} aria-pressed={pressed} onClick={() => void onClick()} className={cn("rounded p-1 hover:bg-surface-2", danger ? "hover:text-important" : "hover:text-text", pressed && "text-accent")}>
      {children}
    </button>
  );
}
