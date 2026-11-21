"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CornerDownLeft } from "lucide-react";
import { api } from "@/lib/client/api";
import { Button, Textarea } from "@/components/ui/primitives";
import { useToast } from "@/components/ui/Toast";
import type { CaptureProposal } from "@/lib/schemas/capture";
import { ProposalCard, type CaptureDTO } from "./ProposalCard";

/**
 * Universal natural-language input. Submitting classifies the text and shows
 * a proposal; nothing is filed until the user confirms it.
 */
export function QuickCapture({ today, autoFocus }: { today: string; autoFocus?: boolean }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [capture, setCapture] = useState<CaptureDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  // Text handed over from the command palette (?capture=…).
  const handoff = params.get("capture");
  useEffect(() => {
    if (handoff) {
      setText(handoff);
      ref.current?.focus();
      router.replace("/", { scroll: false });
    }
  }, [handoff, router]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        ref.current?.focus();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function submit() {
    const value = text.trim();
    if (!value || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ capture: CaptureDTO & { aiError?: string | null } }>("/api/v1/captures", { body: { text: value } });
      setCapture(res.capture);
      setText("");
      // No refresh here: the open proposal would otherwise also appear in the
      // Inbox. If it is left unfiled, it shows there on the next load.
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not capture that");
    } finally {
      setBusy(false);
    }
  }

  async function confirm(proposal: CaptureProposal) {
    if (!capture) return;
    const res = await api<{ href: string; resultType: string }>(`/api/v1/captures/${capture.id}/confirm`, { body: { proposal } });
    setCapture(null);
    toast({ message: `Saved as ${LABELS[res.resultType] ?? res.resultType}.`, action: { label: "View", run: () => router.push(res.href) } });
    router.refresh();
    ref.current?.focus();
  }

  async function discard() {
    if (!capture) return;
    await api(`/api/v1/captures/${capture.id}/discard`, { body: {} });
    setCapture(null);
    router.refresh();
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="relative"
      >
        <label htmlFor="quick-capture" className="sr-only">
          Quick capture
        </label>
        <Textarea
          id="quick-capture"
          ref={ref}
          autoFocus={autoFocus}
          rows={2}
          value={text}
          maxLength={5000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
          placeholder="Capture anything — a task, a thought, an idea, how today went…"
          className="resize-none pr-24 text-[15px]"
        />
        <Button type="submit" variant="primary" size="sm" disabled={busy || !text.trim()} className="absolute bottom-2.5 right-2.5">
          {busy ? "Sorting…" : (
            <>
              Capture <CornerDownLeft size={12} aria-hidden />
            </>
          )}
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-important">
          {error}
        </p>
      )}
      {capture && <ProposalCard key={capture.id} capture={capture} today={today} onConfirm={confirm} onDiscard={discard} className="mt-3" />}
    </div>
  );
}

export const LABELS: Record<string, string> = {
  task: "a task",
  journal: "a journal entry",
  goal: "a goal",
  project: "a project idea",
  curiosity: "a curiosity",
  leisure: "chosen leisure",
  memory: "something about you",
};
