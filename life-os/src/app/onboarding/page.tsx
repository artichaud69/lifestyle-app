import { redirect } from "next/navigation";
import { requirePageUser } from "@/server/auth/current";
import { listDomains } from "@/server/modules/domains/service";
import { getAiProvider } from "@/server/ai";
import { Onboarding } from "./Onboarding";

export const metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await requirePageUser({ allowUnonboarded: true });
  if (user.onboardedAt) redirect("/");
  const domains = await listDomains(user.id);
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Onboarding
        displayName={user.displayName}
        domains={domains.map((d) => ({ key: d.key, name: d.name, description: d.description ?? "" }))}
        aiConfigured={getAiProvider() !== null}
      />
    </main>
  );
}
