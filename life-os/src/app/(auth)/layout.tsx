import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  if (await getCurrentUser()) redirect("/");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-muted">LIFE OS</p>
          <p className="mt-2 text-sm text-muted">A private place to understand and direct your life.</p>
        </div>
        {children}
      </div>
    </main>
  );
}
