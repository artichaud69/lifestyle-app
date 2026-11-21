"use client";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/** Click-to-edit text. Enter saves, Escape cancels; empty values are rejected. */
export function InlineText({ value, onSave, className, multiline, ariaLabel }: { value: string; onSave: (v: string) => Promise<void>; className?: string; multiline?: boolean; ariaLabel: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  useEffect(() => {
    if (editing) ref.current?.focus();
  }, [editing]);

  async function commit() {
    const v = draft.trim();
    if (!v || v === value) {
      setDraft(value);
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(v);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing)
    return (
      <button type="button" aria-label={`Edit ${ariaLabel}`} onClick={() => setEditing(true)} className={cn("cursor-text text-left hover:bg-surface-2 rounded px-1 -mx-1", className)}>
        {value}
      </button>
    );
  const props = {
    ref,
    value: draft,
    disabled: saving,
    "aria-label": ariaLabel,
    onChange: (e: { target: { value: string } }) => setDraft(e.target.value),
    onBlur: commit,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraft(value);
        setEditing(false);
      } else if (e.key === "Enter" && (!multiline || e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        void commit();
      }
    },
    className: cn("w-full rounded border border-accent bg-surface px-1 -mx-1 text-text focus:outline-none", className),
  };
  return multiline ? <textarea rows={4} {...props} /> : <input {...props} />;
}
