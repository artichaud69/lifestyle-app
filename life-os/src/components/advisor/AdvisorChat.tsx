"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { Badge, Button, Select, Textarea } from "@/components/ui/primitives";
import type { ContextRef } from "@/lib/schemas/advisor";
import { cn } from "@/lib/utils";

type Msg = { id: string; role: "USER" | "ASSISTANT"; content: string; generator: string | null; contextRefs: ContextRef[] };

const MODES = [
  ["STRATEGIST", "Strategist", "priorities, trade-offs, big decisions"],
  ["ANALYST", "Analyst", "patterns and structured reasoning"],
  ["COACH", "Coach", "supportive, small next steps"],
  ["PLANNER", "Planner", "tasks, time, sequencing"],
  ["EXPLORER", "Explorer", "curiosity and ideas"],
  ["REFLECTOR", "Reflector", "open reflection"],
] as const;

const SUGGESTIONS = [
  "What should I focus on this week?",
  "What should I do with my free afternoon?",
  "Which of my projects should I prioritise?",
  "Help me think through a decision I'm stuck on.",
];

const HREF: Record<ContextRef["kind"], (id: string) => string> = {
  memory: (id) => `/memory#memory-${id}`,
  journal: (id) => `/life/journal#entry-${id}`,
  task: (id) => `/today#task-${id}`,
  goal: (id) => `/life/goals#goal-${id}`,
  project: (id) => `/projects#project-${id}`,
  curiosity: (id) => `/projects#curiosity-${id}`,
  value: () => "/life/identity",
  plan: () => "/today",
};

export function AdvisorChat({
  conversations,
  current,
  mode: initialMode,
  status,
  scopes,
}: {
  conversations: Array<{ id: string; title: string; updatedAt: Date | string }>;
  current: { id: string; messages: Msg[] } | null;
  mode: string;
  status: "ai" | "no-consent" | "not-configured";
  scopes: Record<string, boolean>;
}) {
  const router = useRouter();
  const toast = useToast();
  const [messages, setMessages] = useState<Msg[]>(current?.messages ?? []);
  const [conversationId, setConversationId] = useState(current?.id ?? null);
  const [text, setText] = useState("");
  const [mode, setMode] = useState(initialMode);
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  async function send(message: string) {
    if (!message.trim() || busy) return;
    setBusy(true);
    const optimistic: Msg = { id: `tmp-${Date.now()}`, role: "USER", content: message, generator: null, contextRefs: [] };
    setMessages((m) => [...m, optimistic]);
    setText("");
    try {
      const res = await api<{ conversationId: string; message: Msg; contextRefs: ContextRef[] }>("/api/v1/advisor", {
        body: { conversationId, message, mode },
      });
      setMessages((m) => [...m, { ...res.message, contextRefs: res.contextRefs }]);
      if (!conversationId) {
        setConversationId(res.conversationId);
        router.replace(`/advisor?c=${res.conversationId}`, { scroll: false });
      }
      router.refresh();
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== optimistic.id));
      setText(message);
      toast({ message: e instanceof Error ? e.message : "The advisor could not answer", tone: "error" });
    } finally {
      setBusy(false);
    }
  }

  const disallowed = Object.entries(scopes).filter(([, v]) => !v).map(([k]) => k.toLowerCase());

  return (
    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block" aria-label="Conversations">
        <Link href="/advisor" className="mb-3 block rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface-2">+ New conversation</Link>
        <ul className="space-y-0.5">
          {conversations.map((c) => (
            <li key={c.id} className="group flex items-center">
              <Link href={`/advisor?c=${c.id}`} className={cn("flex-1 truncate rounded-lg px-2 py-1.5 text-sm", c.id === conversationId ? "bg-surface-2 text-text" : "text-muted hover:text-text")}>
                {c.title}
              </Link>
              <button
                aria-label={`Delete conversation “${c.title}”`}
                className="px-1 text-faint opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-important"
                onClick={async () => {
                  await api(`/api/v1/advisor/conversations/${c.id}`, { method: "DELETE" });
                  if (c.id === conversationId) router.push("/advisor");
                  router.refresh();
                }}
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex min-h-[70dvh] flex-col" aria-label="Advisor conversation">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">Advisor</h1>
          <label className="flex items-center gap-2 text-xs text-muted">
            Role
            <Select value={mode} onChange={(e) => setMode(e.target.value)} className="h-8 w-40 text-xs" aria-label="Advisor role">
              {MODES.map(([k, l]) => (
                <option key={k} value={k}>{l}</option>
              ))}
            </Select>
          </label>
        </div>

        {status !== "ai" && (
          <div className="mb-4 rounded-xl border border-border bg-surface-2 px-4 py-3 text-sm text-muted">
            {status === "no-consent" ? (
              <>
                AI answers are off because you haven&apos;t allowed LIFE OS to send records to the AI provider. You&apos;ll still see which of your records are relevant.{" "}
                <Link href="/settings#ai" className="text-accent hover:underline">Change in Settings</Link>
              </>
            ) : (
              <>No AI provider is configured on this server, so the advisor shows the relevant records it finds instead of an AI answer.</>
            )}
          </div>
        )}

        <div className="flex-1 space-y-4">
          {messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6">
              <p className="text-sm text-muted">Ask anything about your life, plans or decisions. Answers use your own records{disallowed.length ? ` (except ${disallowed.join(", ")}, which you've kept private)` : ""}, and show what they were based on.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => void send(s)} className="rounded-full border border-border px-3 py-1.5 text-xs text-muted hover:text-text">{s}</button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} m={m} />
          ))}
          {busy && <p className="text-sm text-faint">Thinking it through…</p>}
          <div ref={end} />
        </div>

        <form
          className="sticky bottom-20 mt-6 md:bottom-4"
          onSubmit={(e) => {
            e.preventDefault();
            void send(text);
          }}
        >
          <div className="relative rounded-2xl border border-border bg-surface shadow-sm">
            <Textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send(text);
                }
              }}
              placeholder="Ask the advisor…"
              aria-label="Message the advisor"
              maxLength={8000}
              className="resize-none border-0 pr-20 focus:ring-0"
            />
            <Button type="submit" variant="primary" size="sm" disabled={busy || !text.trim()} className="absolute bottom-2.5 right-2.5">Send</Button>
          </div>
          <p className="mt-1.5 text-center text-[11px] text-faint">Suggestions, not instructions. The advisor can be wrong and doesn&apos;t replace a professional.</p>
        </form>
      </section>
    </div>
  );
}

function Message({ m }: { m: Msg }) {
  if (m.role === "USER")
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl bg-accent-soft px-4 py-2.5 text-sm">{m.content}</p>
      </div>
    );
  return (
    <article className="fade-in max-w-[92%]">
      <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {m.generator === "offline" && <Badge>not an AI answer</Badge>}
        {m.contextRefs.length > 0 && (
          <details className="text-xs text-muted">
            <summary className="cursor-pointer">Based on {m.contextRefs.length} record{m.contextRefs.length === 1 ? "" : "s"}</summary>
            <ul className="mt-1 space-y-0.5">
              {m.contextRefs.map((r) => (
                <li key={`${r.kind}:${r.id}`}>
                  <Link href={HREF[r.kind](r.id)} className="hover:underline">
                    <span className="text-faint">{r.kind}</span> · {r.label}
                    {r.status === "AI_INFERENCE" && <span className="text-faint"> (unconfirmed inference)</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </article>
  );
}
