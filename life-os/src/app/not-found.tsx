import Link from "next/link";
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2 px-4 text-center">
      <p className="text-sm text-muted">This page doesn&apos;t exist.</p>
      <Link href="/" className="text-sm text-accent hover:underline">Back home</Link>
    </main>
  );
}
