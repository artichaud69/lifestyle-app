"use client";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { Button, Card, Input, Label } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

const REASONS = [
  "Plan my days and weeks realistically",
  "Keep track of goals and projects",
  "Reflect and understand myself better",
  "Manage stress and protect recovery",
  "Make better decisions",
  "Make room for things I enjoy",
];

const SCOPES = [
  { key: "PROFILE", label: "Values and what you tell it about yourself" },
  { key: "GOALS", label: "Goals and projects" },
  { key: "PLANNING", label: "Tasks and daily plans" },
  { key: "MEMORY", label: "Remembered situations and patterns" },
  { key: "JOURNAL", label: "Journal entries", note: "Sensitive — off by default" },
] as const;

export function Onboarding({ displayName, domains, aiConfigured }: { displayName: string; domains: Array<{ key: string; name: string; description: string }>; aiConfigured: boolean }) {
  const [name, setName] = useState(displayName);
  const [reasons, setReasons] = useState<string[]>([]);
  const [active, setActive] = useState<string[]>(domains.map((d) => d.key));
  const [priorities, setPriorities] = useState("");
  const [mode, setMode] = useState<"MINIMAL" | "STANDARD" | "ANALYTICAL">("STANDARD");
  const [consent, setConsent] = useState(false);
  const [scopes, setScopes] = useState<string[]>(["PROFILE", "GOALS", "PLANNING", "MEMORY"]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (list: string[], set: (v: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  async function submit() {
    setBusy(true);
    setError(null);
    try {
      await api("/api/v1/onboarding", {
        body: {
          displayName: name,
          usageReasons: reasons,
          activeDomains: active,
          priorities: priorities.split("\n").map((p) => p.trim()).filter(Boolean).slice(0, 5),
          interfaceMode: mode,
          externalAiConsent: consent,
          aiScopes: scopes,
        },
      });
      window.location.href = "/";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold tracking-[0.3em] text-muted">LIFE OS</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Let&apos;s set up the basics</h1>
        <p className="mt-1 text-sm text-muted">Two minutes. Everything here can be changed later, and you can skip what doesn&apos;t fit.</p>
      </header>

      <Card>
        <Label htmlFor="name">Preferred name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">What would you like help with?</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {REASONS.map((r) => (
            <Chip key={r} on={reasons.includes(r)} onClick={() => toggle(reasons, setReasons, r)}>
              {r}
            </Chip>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">Which parts of life matter to you right now?</h2>
        <p className="mt-0.5 text-xs text-muted">These stay separate — LIFE OS never folds them into a single score.</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {domains.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-pressed={active.includes(d.key)}
              onClick={() => toggle(active, setActive, d.key)}
              className={cn("rounded-xl border p-3 text-left transition", active.includes(d.key) ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2")}
            >
              <span className="block text-sm font-medium">{d.name}</span>
              <span className="block text-xs text-muted">{d.description}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <Label htmlFor="priorities">Current priorities (one per line, optional)</Label>
        <textarea
          id="priorities"
          rows={3}
          value={priorities}
          onChange={(e) => setPriorities(e.target.value)}
          placeholder={"Recover after a demanding quarter\nMore one-to-one time with each child"}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-faint"
        />
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">How much should the interface show?</h2>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {(
            [
              ["MINIMAL", "Minimal", "Calm, only what's needed today"],
              ["STANDARD", "Standard", "A balanced overview"],
              ["ANALYTICAL", "Analytical", "More detail and numbers"],
            ] as const
          ).map(([k, l, d]) => (
            <button key={k} type="button" aria-pressed={mode === k} onClick={() => setMode(k)} className={cn("rounded-xl border p-3 text-left", mode === k ? "border-accent bg-accent-soft" : "border-border hover:bg-surface-2")}>
              <span className="block text-sm font-medium">{l}</span>
              <span className="block text-xs text-muted">{d}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold">AI and privacy</h2>
        <p className="mt-0.5 text-xs text-muted">
          The advisor and smart capture work by sending relevant records to an external AI provider (Anthropic). Without your permission, LIFE OS
          still works: capture uses local rules and the advisor shows the records it found instead of an AI answer.
        </p>
        <div className="mt-2">
          <Switch
            checked={consent}
            onChange={setConsent}
            label="Allow sending my records to the AI provider"
            description={aiConfigured ? "You can withdraw this at any time in Settings." : "No AI provider is configured on this server yet; this takes effect once one is."}
          />
          <p className="mt-3 text-xs font-medium text-muted">When allowed, the AI may read:</p>
          {SCOPES.map((s) => (
            <Switch key={s.key} checked={scopes.includes(s.key)} onChange={() => toggle(scopes, setScopes, s.key)} label={s.label} description={"note" in s ? s.note : undefined} />
          ))}
        </div>
      </Card>

      {error && (
        <p role="alert" className="rounded-lg bg-important-soft px-3 py-2 text-sm text-important">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button variant="primary" onClick={submit} disabled={busy || !name.trim() || active.length === 0}>
          {busy ? "Saving…" : "Start using LIFE OS"}
        </Button>
      </div>
    </div>
  );
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn("rounded-full border px-3 py-1.5 text-xs transition", on ? "border-accent bg-accent-soft text-accent" : "border-border text-muted hover:text-text")}>
      {children}
    </button>
  );
}
