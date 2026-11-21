"use client";
import { useState } from "react";
import { ApiError } from "@/lib/client/api";
import { Badge, Button, Input, Label, Select, Textarea } from "@/components/ui/primitives";
import { CAPTURE_TYPES, LOW_CONFIDENCE, captureProposal, type CaptureProposal, type CaptureType } from "@/lib/schemas/capture";
import { DOMAIN_KEYS } from "@/lib/schemas/common";
import { cn } from "@/lib/utils";

export type CaptureDTO = {
  id: string;
  rawText: string;
  classifier: "AI" | "RULES";
  confidence: number;
  proposal: CaptureProposal | null;
  rationale: string;
  alternatives: string[];
  aiError?: string | null;
};

const TYPE_LABEL: Record<CaptureType, string> = {
  task: "Task",
  journal: "Journal",
  goal: "Goal",
  project: "Project idea",
  curiosity: "Curiosity",
  leisure: "Chosen leisure",
  memory: "About me",
};

const TYPE_HINT: Record<CaptureType, string> = {
  task: "Something to do.",
  journal: "A reflection, kept in your own words.",
  goal: "An outcome to work toward.",
  project: "Something to build or explore over time. Saved as an idea; nothing is scheduled.",
  curiosity: "A question for your curiosity inbox.",
  leisure: "Time you chose for enjoyment. It goes on that day's plan — no judgement attached.",
  memory: "Something lasting about you. You can review or delete it on the Memory screen.",
};

/** Re-shapes a proposal when the user picks a different destination, keeping their words. */
export function convertProposal(p: CaptureProposal | null, type: CaptureType, raw: string, today: string): CaptureProposal {
  const text =
    p && "title" in p ? p.title : p && "body" in p ? p.body : p && "question" in p ? p.question : p && "content" in p ? p.content : p && "label" in p ? p.label : raw;
  const date = p?.type === "task" ? p.dueDate : p?.type === "leisure" ? p.date : null;
  switch (type) {
    case "task":
      return { type, title: text, dueDate: date, estimateMinutes: p?.type === "leisure" ? p.minutes : null, effort: null };
    case "journal":
      return { type, body: raw, tags: [] };
    case "goal":
      return { type, title: text, domainKey: null, motivation: null };
    case "project":
      return { type, title: text, purpose: null, kind: "PERSONAL" };
    case "curiosity":
      return { type, question: text, theme: null };
    case "leisure":
      return { type, label: text, date: date ?? today, minutes: p?.type === "task" ? p.estimateMinutes : null };
    case "memory":
      return { type, content: raw, domainKey: null };
  }
}

export function ProposalCard({
  capture,
  today,
  onConfirm,
  onDiscard,
  className,
}: {
  capture: CaptureDTO;
  today: string;
  onConfirm: (p: CaptureProposal) => Promise<void>;
  onDiscard: () => Promise<void>;
  className?: string;
}) {
  const [proposal, setProposal] = useState<CaptureProposal>(capture.proposal ?? convertProposal(null, "journal", capture.rawText, today));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsure = capture.confidence < LOW_CONFIDENCE || !capture.proposal;
  const set = (patch: Partial<CaptureProposal>) => setProposal((p) => ({ ...p, ...patch }) as CaptureProposal);

  async function confirm() {
    const parsed = captureProposal.safeParse(proposal);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the fields");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await onConfirm(parsed.data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save");
      setBusy(false);
    }
  }

  const ordered = unsure
    ? [proposal.type, ...capture.alternatives.filter((a): a is CaptureType => CAPTURE_TYPES.includes(a as CaptureType)), ...CAPTURE_TYPES]
    : [...CAPTURE_TYPES];
  const types = [...new Set(ordered)];

  return (
    <div
      role="group"
      aria-label="Capture proposal"
      className={cn("fade-in rounded-2xl border bg-surface p-4", unsure ? "border-important/40" : "border-border", className)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void confirm();
        if (e.key === "Escape") void onDiscard();
      }}
    >
      <p className="text-xs text-muted">
        {unsure ? "I'm not sure where this belongs — where should it go?" : "Save this as:"}
        {capture.classifier === "RULES" && <span className="ml-1 text-faint">(sorted locally)</span>}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5" role="radiogroup" aria-label="Destination">
        {types.map((t) => (
          <button
            key={t}
            type="button"
            role="radio"
            aria-checked={proposal.type === t}
            onClick={() => setProposal((p) => (p.type === t ? p : convertProposal(p, t, capture.rawText, today)))}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs transition",
              proposal.type === t ? (t === "leisure" ? "border-leisure bg-leisure-soft text-leisure" : "border-accent bg-accent-soft text-accent") : "border-border text-muted hover:text-text",
            )}
          >
            {TYPE_LABEL[t]}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-faint">{TYPE_HINT[proposal.type]}</p>

      <div className="mt-3 grid gap-3">
        {proposal.type === "task" && (
          <>
            <Field label="Task">
              <Input value={proposal.title} onChange={(e) => set({ title: e.target.value })} aria-label="Task title" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Due (optional)">
                <Input type="date" value={proposal.dueDate ?? ""} onChange={(e) => set({ dueDate: e.target.value || null })} aria-label="Due date" />
              </Field>
              <Field label="Minutes (optional)">
                <Input
                  type="number"
                  min={1}
                  value={proposal.estimateMinutes ?? ""}
                  onChange={(e) => set({ estimateMinutes: e.target.value ? Number(e.target.value) : null })}
                  aria-label="Estimated minutes"
                />
              </Field>
            </div>
          </>
        )}
        {proposal.type === "journal" && (
          <Field label="Entry">
            <Textarea rows={3} value={proposal.body} onChange={(e) => set({ body: e.target.value })} aria-label="Journal text" />
          </Field>
        )}
        {(proposal.type === "goal" || proposal.type === "project") && (
          <Field label={proposal.type === "goal" ? "Goal" : "Project"}>
            <Input value={proposal.title} onChange={(e) => set({ title: e.target.value })} aria-label="Title" />
          </Field>
        )}
        {proposal.type === "goal" && (
          <Field label="Life area (optional)">
            <Select value={proposal.domainKey ?? ""} onChange={(e) => set({ domainKey: (e.target.value || null) as never })} aria-label="Life area">
              <option value="">—</option>
              {DOMAIN_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k[0]!.toUpperCase() + k.slice(1)}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {proposal.type === "project" && (
          <Field label="Kind">
            <Select value={proposal.kind} onChange={(e) => set({ kind: e.target.value as never })} aria-label="Project kind">
              {["PERSONAL", "LEARNING", "CREATIVE", "RECREATION", "HOME", "WORK"].map((k) => (
                <option key={k} value={k}>
                  {k[0] + k.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {proposal.type === "curiosity" && (
          <Field label="Question">
            <Input value={proposal.question} onChange={(e) => set({ question: e.target.value })} aria-label="Question" />
          </Field>
        )}
        {proposal.type === "leisure" && (
          <>
            <Field label="What">
              <Input value={proposal.label} onChange={(e) => set({ label: e.target.value })} aria-label="Leisure activity" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Day">
                <Input type="date" value={proposal.date} onChange={(e) => set({ date: e.target.value })} aria-label="Day" />
              </Field>
              <Field label="Minutes (optional)">
                <Input type="number" min={5} value={proposal.minutes ?? ""} onChange={(e) => set({ minutes: e.target.value ? Number(e.target.value) : null })} aria-label="Minutes" />
              </Field>
            </div>
          </>
        )}
        {proposal.type === "memory" && (
          <Field label="About you">
            <Textarea rows={2} value={proposal.content} onChange={(e) => set({ content: e.target.value })} aria-label="Statement about you" />
          </Field>
        )}
      </div>

      {capture.aiError && <p className="mt-2 text-xs text-faint">AI sorting was unavailable ({capture.aiError}); this suggestion came from local rules.</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm text-important">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center justify-between gap-2">
        <span className="text-xs text-faint">
          {capture.rationale} {!unsure && <Badge className="ml-1">{Math.round(capture.confidence * 100)}% sure</Badge>}
        </span>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="ghost" onClick={() => void onDiscard()} disabled={busy}>
            Discard
          </Button>
          <Button size="sm" variant="primary" onClick={() => void confirm()} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
