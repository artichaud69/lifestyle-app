"use client";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { useMutate } from "@/lib/client/useMutate";
import { Button, Card, CardTitle, Input, Label, Select } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/Switch";
import { cn } from "@/lib/utils";

type S = {
  interfaceMode: "MINIMAL" | "STANDARD" | "ANALYTICAL";
  theme: "SYSTEM" | "LIGHT" | "DARK";
  timezone: string;
  weekStartsOn: number;
  recoveryMode: boolean;
  quietMode: boolean;
  proactiveInsights: boolean;
  externalAiConsent: boolean;
  aiScopes: Record<string, boolean>;
};

const SCOPES = [
  ["PROFILE", "Values and things you've told it about yourself"],
  ["GOALS", "Goals, projects and curiosity items"],
  ["PLANNING", "Tasks and daily plans"],
  ["MEMORY", "Situations, experiences and patterns"],
  ["JOURNAL", "Journal entries (sensitive)"],
] as const;

export function SettingsView({ displayName, email, settings, providerId, sessions }: { displayName: string; email: string; settings: S; providerId: string | null; sessions: Array<{ id: string; userAgent: string | null; lastSeenAt: Date | string; current: boolean }> }) {
  const call = useMutate();
  const [s, setS] = useState(settings);
  const [name, setName] = useState(displayName);
  const save = async (patch: Partial<S> & { displayName?: string }) => {
    setS((prev) => ({ ...prev, ...patch, aiScopes: { ...prev.aiScopes, ...(patch.aiScopes ?? {}) } }));
    const res = await call("/api/v1/settings", "PATCH", patch);
    if (!res) setS(settings);
    if (patch.theme) document.documentElement.dataset.theme = patch.theme === "SYSTEM" ? "" : patch.theme.toLowerCase();
    if (patch.theme === "SYSTEM") delete document.documentElement.dataset.theme;
  };

  return (
    <div className="space-y-6">
      <Card aria-label="Profile">
        <CardTitle hint={email}>Profile</CardTitle>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) void save({ displayName: name.trim() }); }}>
          <Input value={name} onChange={(e) => setName(e.target.value)} aria-label="Preferred name" maxLength={60} />
          <Button type="submit">Save</Button>
        </form>
      </Card>

      <Card aria-label="Interface">
        <CardTitle>Interface</CardTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Information density</Label>
            <div className="flex gap-1">
              {(["MINIMAL", "STANDARD", "ANALYTICAL"] as const).map((m) => (
                <button key={m} aria-pressed={s.interfaceMode === m} onClick={() => save({ interfaceMode: m })} className={cn("flex-1 rounded-lg border px-2 py-1.5 text-xs", s.interfaceMode === m ? "border-accent bg-accent-soft text-accent" : "border-border text-muted")}>
                  {m[0] + m.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Appearance</Label>
            <div className="flex gap-1">
              {(["SYSTEM", "LIGHT", "DARK"] as const).map((t) => (
                <button key={t} aria-pressed={s.theme === t} onClick={() => save({ theme: t })} className={cn("flex-1 rounded-lg border px-2 py-1.5 text-xs", s.theme === t ? "border-accent bg-accent-soft text-accent" : "border-border text-muted")}>
                  {t[0] + t.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="tz">Timezone</Label>
            <Input id="tz" defaultValue={s.timezone} onBlur={(e) => e.target.value !== s.timezone && save({ timezone: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="week">Week starts on</Label>
            <Select id="week" value={s.weekStartsOn} onChange={(e) => save({ weekStartsOn: Number(e.target.value) })}>
              <option value={1}>Monday</option>
              <option value={0}>Sunday</option>
              <option value={6}>Saturday</option>
            </Select>
          </div>
        </div>
      </Card>

      <Card aria-label="Capacity and quiet" id="recovery">
        <CardTitle>Capacity & quiet</CardTitle>
        <Switch
          checked={s.recoveryMode}
          onChange={(v) => save({ recoveryMode: v })}
          label="Recovery mode"
          description="For stress, illness or low capacity. Hides achievement metrics and patterns, puts recovery first, keeps only what matters. Stay in it as long as you need."
        />
        <Switch checked={s.quietMode} onChange={(v) => save({ quietMode: v })} label="Quiet mode" description="No proactive messages of any kind." />
        <Switch
          checked={s.proactiveInsights && !s.quietMode}
          disabled={s.quietMode}
          onChange={(v) => save({ proactiveInsights: v })}
          label="Proactive observations"
          description="Opt-in. Not active in this version yet; your choice is saved for when it is. Journal and well-being data never trigger unsolicited messages."
        />
      </Card>

      <Card aria-label="AI and privacy" id="ai">
        <CardTitle hint={providerId ? `Provider configured: ${providerId}` : "No AI provider is configured on this server; AI features fall back to local behaviour."}>AI & privacy</CardTitle>
        <Switch
          checked={s.externalAiConsent}
          onChange={(v) => save({ externalAiConsent: v })}
          label="Allow sending records to the AI provider"
          description="Needed for AI capture sorting and AI answers. Only records relevant to a request, within the areas below, are sent. Your data is not used to train models by LIFE OS."
        />
        <p className="mt-3 text-xs font-medium text-muted">What the AI may read</p>
        {SCOPES.map(([k, l]) => (
          <Switch key={k} checked={!!s.aiScopes[k]} onChange={(v) => save({ aiScopes: { [k]: v } })} label={l} />
        ))}
        <p className="mt-2 text-xs text-faint">Individual journal entries and memories can also be hidden from the AI on their own screens.</p>
      </Card>

      <Card aria-label="Sessions">
        <CardTitle action={sessions.length > 1 ? <Button size="sm" onClick={() => call("/api/v1/sessions", "DELETE")}>Sign out other devices</Button> : undefined}>Signed-in devices</CardTitle>
        <ul className="divide-y divide-border">
          {sessions.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <span className="min-w-0">
                <span className="block truncate">{describeAgent(x.userAgent)}</span>
                <span className="text-xs text-faint">Last active {new Date(x.lastSeenAt).toLocaleString("en-GB")}{x.current && " · this device"}</span>
              </span>
              {!x.current && <Button size="sm" variant="ghost" onClick={() => call(`/api/v1/sessions/${x.id}`, "DELETE")}>Revoke</Button>}
            </li>
          ))}
        </ul>
      </Card>

      <Card aria-label="Your data" id="data">
        <CardTitle hint="Everything you own, in documented JSON. No lock-in.">Your data</CardTitle>
        <a href="/api/v1/export" className="inline-flex h-9 items-center rounded-lg border border-border px-3.5 text-sm hover:bg-surface-2" download>
          Download full export
        </a>
        <DeleteAccount />
      </Card>
    </div>
  );
}

function describeAgent(ua: string | null) {
  if (!ua) return "Unknown device";
  const browser = /Firefox/.test(ua) ? "Firefox" : /Edg\//.test(ua) ? "Edge" : /Chrome/.test(ua) ? "Chrome" : /Safari/.test(ua) ? "Safari" : "Browser";
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Android/.test(ua) ? "Android" : /Mac OS/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return `${browser}${os ? ` on ${os}` : ""}`;
}

function DeleteAccount() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="mt-4 block text-xs text-important hover:underline">
        Delete my account and all data…
      </button>
    );
  return (
    <form
      className="mt-4 space-y-2 rounded-xl border border-important/40 p-3"
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          await api("/api/v1/account/delete", { body: { password, confirm } });
          window.location.href = "/signup";
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not delete");
        }
      }}
    >
      <p className="text-sm">This permanently deletes every record, memory and conversation. Consider downloading an export first.</p>
      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" aria-label="Password" autoComplete="current-password" />
      <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Type DELETE to confirm" aria-label="Type DELETE to confirm" />
      {error && <p role="alert" className="text-xs text-important">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" variant="danger" disabled={confirm !== "DELETE" || !password}>Delete everything</Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
      </div>
    </form>
  );
}
