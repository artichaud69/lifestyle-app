"use client";
import Link from "next/link";
import { useState } from "react";
import { api, ApiError } from "@/lib/client/api";
import { Button, Card, Input, Label } from "@/components/ui/primitives";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const body = Object.fromEntries(form.entries());
      const res = await api<{ next: string }>(`/api/auth/${mode}`, { body });
      window.location.href = res.next;
    } catch (err) {
      const fieldErrors = err instanceof ApiError ? (err.details as { fieldErrors?: Record<string, string[]> })?.fieldErrors : undefined;
      setError(fieldErrors ? Object.values(fieldErrors).flat()[0] ?? "Check the form" : err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <Card>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-lg font-semibold">{mode === "login" ? "Sign in" : "Create your space"}</h1>
        {mode === "signup" && (
          <div>
            <Label htmlFor="displayName">What should LIFE OS call you?</Label>
            <Input id="displayName" name="displayName" required maxLength={60} autoComplete="given-name" />
          </div>
        )}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={mode === "signup" ? 12 : 1}
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
          {mode === "signup" && <p className="mt-1 text-xs text-faint">At least 12 characters. A short sentence works well.</p>}
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-important-soft px-3 py-2 text-sm text-important">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" className="w-full" disabled={busy}>
          {busy ? "One moment…" : mode === "login" ? "Sign in" : "Create account"}
        </Button>
        <p className="text-center text-xs text-muted">
          {mode === "login" ? (
            <>
              New here? <Link className="text-accent hover:underline" href="/signup">Create an account</Link>
            </>
          ) : (
            <>
              Already have an account? <Link className="text-accent hover:underline" href="/login">Sign in</Link>
            </>
          )}
        </p>
      </form>
    </Card>
  );
}
