"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { useToast } from "@/components/ui/Toast";
import { ProposalCard, type CaptureDTO } from "@/components/capture/ProposalCard";
import { LABELS } from "@/components/capture/QuickCapture";
import type { CaptureProposal } from "@/lib/schemas/capture";

export function CaptureInbox({ captures, today }: { captures: CaptureDTO[]; today: string }) {
  const [open, setOpen] = useState<string | null>(null);
  const router = useRouter();
  const toast = useToast();
  if (!captures.length) return <p className="text-xs text-faint">Nothing waiting. Captures you haven&apos;t filed yet appear here.</p>;
  return (
    <ul className="space-y-2">
      {captures.map((c) =>
        open === c.id ? (
          <li key={c.id}>
            <ProposalCard
              capture={c}
              today={today}
              onConfirm={async (p: CaptureProposal) => {
                const res = await api<{ resultType: string }>(`/api/v1/captures/${c.id}/confirm`, { body: { proposal: p } });
                toast({ message: `Saved as ${LABELS[res.resultType]}.` });
                setOpen(null);
                router.refresh();
              }}
              onDiscard={async () => {
                await api(`/api/v1/captures/${c.id}/discard`, { body: {} });
                setOpen(null);
                router.refresh();
              }}
            />
          </li>
        ) : (
          <li key={c.id}>
            <button onClick={() => setOpen(c.id)} className="w-full rounded-lg border border-border px-3 py-2 text-left text-sm hover:bg-surface-2">
              <span className="line-clamp-2">{c.rawText}</span>
              <span className="text-xs text-faint">Tap to file</span>
            </button>
          </li>
        ),
      )}
    </ul>
  );
}
