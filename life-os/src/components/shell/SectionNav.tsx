"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function SectionNav({ items }: { items: ReadonlyArray<{ href: string; label: string }> }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Section" className="-mx-1 mb-6 flex gap-1 overflow-x-auto">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          aria-current={pathname === i.href ? "page" : undefined}
          className={cn("whitespace-nowrap rounded-lg px-3 py-1.5 text-sm", pathname === i.href ? "bg-surface-2 font-medium text-text" : "text-muted hover:text-text")}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
