"use client";
import { useState } from "react";
import { EyeOff, Trash2 } from "lucide-react";
import { useMutate } from "@/lib/client/useMutate";
import { InlineText } from "@/components/ui/InlineText";
import { Badge, Button, Card, EmptyState, Textarea } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

type Entry = { id: string; body: string; occurredAt: Date | string; mood: number | null; energy: string | null; tags: string[]; excludeFromAi: boolean };

const MOODS = ["Very low", "Low", "Okay", "Good", "Very good"];

export function JournalView({ entries, aiCanRead }: { entries: Entry[]; aiCanRead: boolean }) {
  const call = useMutate();
  const [body, setBody] = useState("");
  const [mood, setMood] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card id="new" aria-label="New entry">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!body.trim()) return;
            if (await call("/api/v1/journal", "POST", { body: body.trim(), mood })) {
              setBody("");
              setMood(null);
            }
          }}
        >
          <Textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="What mattered today? What was difficult? What did you enjoy?" aria-label="Journal entry" />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5" role="radiogroup" aria-label="Mood (optional)">
              <span className="text-xs text-muted">Mood, if you like:</span>
              {MOODS.map((m, i) => (
                <button key={m} type="button" role="radio" aria-checked={mood === i + 1} onClick={() => setMood(mood === i + 1 ? null : i + 1)} className={cn("rounded-full border px-2 py-0.5 text-xs", mood === i + 1 ? "border-accent bg-accent-soft text-accent" : "border-border text-muted")}>
                  {m}
                </button>
              ))}
            </div>
            <Button type="submit" variant="primary" disabled={!body.trim()}>Save entry</Button>
          </div>
        </form>
        <p className="mt-3 text-xs text-faint">
          {aiCanRead ? "The advisor may read journal entries (you can exclude any single entry)." : "Journal entries are private: the advisor can't read them. You can change this in Settings."}
        </p>
      </Card>

      {entries.length === 0 && <EmptyState title="No entries yet">Anything you capture as a feeling or experience lands here too.</EmptyState>}
      <ol className="space-y-3">
        {entries.map((e) => (
          <li key={e.id} id={`entry-${e.id}`}>
            <Card as="article">
              <div className="mb-2 flex items-center justify-between gap-2">
                <time className="text-xs text-muted" dateTime={new Date(e.occurredAt).toISOString()}>
                  {new Date(e.occurredAt).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </time>
                <div className="flex items-center gap-2">
                  {e.mood && <Badge>{MOODS[e.mood - 1]}</Badge>}
                  {e.tags.map((t) => (
                    <Badge key={t} tone="accent">{t}</Badge>
                  ))}
                  <button
                    onClick={() => call(`/api/v1/journal/${e.id}`, "PATCH", { excludeFromAi: !e.excludeFromAi })}
                    aria-pressed={e.excludeFromAi}
                    title={e.excludeFromAi ? "Hidden from AI — click to allow" : "Hide this entry from the AI"}
                    aria-label={e.excludeFromAi ? "Allow AI to read this entry" : "Hide this entry from the AI"}
                    className={cn("hover:text-text", e.excludeFromAi ? "text-accent" : "text-faint")}
                  >
                    <EyeOff size={14} />
                  </button>
                  {confirmDelete === e.id ? (
                    <span className="flex items-center gap-1 text-xs">
                      Delete permanently?
                      <button className="font-semibold text-important" onClick={async () => { await call(`/api/v1/journal/${e.id}`, "DELETE"); setConfirmDelete(null); }}>Delete</button>
                      <button className="text-muted" onClick={() => setConfirmDelete(null)}>Cancel</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmDelete(e.id)} aria-label="Delete entry" className="text-faint hover:text-important">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
              <InlineText multiline value={e.body} ariaLabel="journal entry" onSave={(body) => call(`/api/v1/journal/${e.id}`, "PATCH", { body }).then(() => undefined)} className="whitespace-pre-wrap text-sm leading-relaxed" />
            </Card>
          </li>
        ))}
      </ol>
    </div>
  );
}
