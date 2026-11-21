"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Compass, Home, Layers, LogOut, Settings, Sparkles, Sun, Search, Leaf } from "lucide-react";
import { ToastProvider } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { api } from "@/lib/client/api";
import { PRIMARY_NAV } from "./nav";
import { CommandPalette } from "./CommandPalette";

const ICONS = { home: Home, sun: Sun, compass: Compass, layers: Layers, chart: BarChart3, sparkles: Sparkles } as const;

export function AppShell({ children, displayName, recoveryMode }: { children: React.ReactNode; displayName: string; recoveryMode: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href) || (href === "/life" && pathname.startsWith("/memory")));

  async function signOut() {
    await api("/api/auth/logout", { body: {} }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <ToastProvider>
      <div className="flex min-h-dvh">
        <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col border-r border-border px-3 py-5 md:flex">
          <Link href="/" className="mb-6 px-2 text-xs font-semibold tracking-[0.3em] text-muted">
            LIFE OS
          </Link>
          <button
            onClick={() => setPaletteOpen(true)}
            className="mb-4 flex h-8 items-center gap-2 rounded-lg border border-border px-2 text-xs text-faint hover:text-text"
          >
            <Search size={14} aria-hidden /> Search or capture <kbd className="ml-auto rounded bg-surface-2 px-1">⌘K</kbd>
          </button>
          <nav aria-label="Primary" className="flex flex-col gap-0.5">
            {PRIMARY_NAV.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors",
                    isActive(item.href) ? "bg-surface-2 font-medium text-text" : "text-muted hover:bg-surface-2 hover:text-text",
                  )}
                >
                  <Icon size={16} aria-hidden /> {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-auto flex flex-col gap-0.5">
            {recoveryMode && (
              <Link href="/settings#recovery" className="mb-2 flex items-center gap-2 rounded-lg bg-ok-soft px-2 py-1.5 text-xs text-ok">
                <Leaf size={14} aria-hidden /> Recovery mode is on
              </Link>
            )}
            <Link
              href="/settings"
              aria-current={pathname.startsWith("/settings") ? "page" : undefined}
              className={cn("flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm", pathname.startsWith("/settings") ? "bg-surface-2 text-text" : "text-muted hover:bg-surface-2 hover:text-text")}
            >
              <Settings size={16} aria-hidden /> Settings
            </Link>
            <button onClick={signOut} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-text">
              <LogOut size={16} aria-hidden /> Sign out
            </button>
            <p className="px-2 pt-2 text-xs text-faint">{displayName}</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10 md:pt-8">{children}</main>

        <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-surface/95 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
          {[...PRIMARY_NAV.filter((i) => i.href !== "/insights"), { href: "/settings", label: "Settings", icon: "settings" as const }].map((item) => {
            const Icon = item.icon === "settings" ? Settings : ICONS[item.icon];
            return (
              <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined} className={cn("flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px]", isActive(item.href) ? "text-accent" : "text-muted")}>
                <Icon size={18} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </ToastProvider>
  );
}
