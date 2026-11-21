"use client";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useMutate } from "@/lib/client/useMutate";
import { InlineText } from "@/components/ui/InlineText";
import { Button, Card, CardTitle, EmptyState, Input } from "@/components/ui/primitives";
import { Switch } from "@/components/ui/Switch";

type Value = { id: string; name: string; description: string | null };
type Domain = { id: string; name: string; description: string | null; isActive: boolean };

export function IdentityView({ values, domains }: { values: Value[]; domains: Domain[] }) {
  const call = useMutate();
  const [name, setName] = useState("");
  return (
    <div className="space-y-6">
      <Card aria-label="Core values">
        <CardTitle hint="A handful is plenty. The advisor uses these to weigh trade-offs — if you allow it to read your profile.">Core values</CardTitle>
        {values.length === 0 && <EmptyState title="No values yet">For example: autonomy, competence, curiosity, family.</EmptyState>}
        <ul className="divide-y divide-border">
          {values.map((v) => (
            <li key={v.id} className="group flex items-start gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <InlineText value={v.name} ariaLabel="value name" onSave={(n) => call(`/api/v1/values/${v.id}`, "PATCH", { name: n }).then(() => undefined)} className="text-sm font-medium" />
                <InlineText
                  value={v.description ?? "What it means to you…"}
                  ariaLabel="value description"
                  onSave={(d) => call(`/api/v1/values/${v.id}`, "PATCH", { description: d }).then(() => undefined)}
                  className={v.description ? "text-sm text-muted" : "text-sm text-faint"}
                />
              </div>
              <button className="text-faint opacity-0 group-hover:opacity-100 focus:opacity-100 hover:text-important" onClick={() => call(`/api/v1/values/${v.id}`, "DELETE")} aria-label={`Delete value ${v.name}`}>
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
        <form
          className="mt-3 flex gap-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (name.trim() && (await call("/api/v1/values", "POST", { name: name.trim() }))) setName("");
          }}
        >
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Add a value…" aria-label="New value" maxLength={80} />
          <Button type="submit">Add</Button>
        </form>
      </Card>

      <Card aria-label="Life areas">
        <CardTitle hint="Rename them to fit your life, or hide the ones that don't matter right now.">Life areas</CardTitle>
        <ul className="divide-y divide-border">
          {domains.map((d) => (
            <li key={d.id} className="flex items-start gap-3 py-2">
              <div className="min-w-0 flex-1">
                <InlineText value={d.name} ariaLabel="area name" onSave={(n) => call(`/api/v1/domains/${d.id}`, "PATCH", { name: n }).then(() => undefined)} className="text-sm font-medium" />
                <p className="text-xs text-muted">{d.description}</p>
              </div>
              <Switch checked={d.isActive} onChange={(isActive) => void call(`/api/v1/domains/${d.id}`, "PATCH", { isActive })} label={d.isActive ? "Shown" : "Hidden"} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
