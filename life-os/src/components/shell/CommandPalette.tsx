"use client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PRIMARY_NAV, LIFE_NAV } from "./nav";

const COMMANDS = [
  ...PRIMARY_NAV.map((n) => ({ label: `Go to ${n.label}`, href: n.href })),
  ...LIFE_NAV.filter((n) => n.href !== "/life").map((n) => ({ label: `Go to ${n.label}`, href: n.href })),
  { label: "Go to Settings", href: "/settings" },
  { label: "Plan today", href: "/today" },
  { label: "Write in journal", href: "/life/journal#new" },
  { label: "Ask the advisor", href: "/advisor" },
  { label: "Export my data", href: "/settings#data" },
];

/** ⌘K: jump anywhere, or send the typed text to Quick Capture on the home screen. */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQ("");
      setIndex(0);
      setTimeout(() => input.current?.focus(), 0);
    }
  }, [open]);

  const items = useMemo(() => {
    const matches = COMMANDS.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
    const capture = q.trim() ? [{ label: `Capture “${q.trim()}”`, href: `/?capture=${encodeURIComponent(q.trim())}` }] : [];
    return [...matches, ...capture];
  }, [q]);

  if (!open) return null;
  const go = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-[15vh]" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Command palette" className="fade-in w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <input
          ref={input}
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setIndex(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "ArrowDown") setIndex((i) => Math.min(i + 1, items.length - 1));
            if (e.key === "ArrowUp") setIndex((i) => Math.max(i - 1, 0));
            if (e.key === "Enter" && items[index]) go(items[index]!.href);
          }}
          placeholder="Where to? Or type anything to capture it…"
          aria-label="Command"
          className="h-12 w-full border-b border-border bg-transparent px-4 text-sm focus:outline-none"
        />
        <ul role="listbox" className="max-h-72 overflow-auto p-1.5">
          {items.map((item, i) => (
            <li key={item.href + item.label} role="option" aria-selected={i === index}>
              <button onMouseEnter={() => setIndex(i)} onClick={() => go(item.href)} className={cn("w-full rounded-lg px-3 py-2 text-left text-sm", i === index ? "bg-surface-2 text-text" : "text-muted")}>
                {item.label}
              </button>
            </li>
          ))}
          {items.length === 0 && <li className="px-3 py-2 text-sm text-faint">Nothing matches.</li>}
        </ul>
      </div>
    </div>
  );
}
