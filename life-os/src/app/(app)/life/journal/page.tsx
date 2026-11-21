import { requirePageUser } from "@/server/auth/current";
import { listJournalEntries } from "@/server/modules/journal/service";
import { getSettings } from "@/server/modules/settings/service";
import { PageHeader } from "@/components/ui/primitives";
import { JournalView } from "@/components/life/JournalView";

export const metadata = { title: "Journal" };

export default async function JournalPage() {
  const user = await requirePageUser();
  const [entries, settings] = await Promise.all([listJournalEntries(user.id, { take: 100 }), getSettings(user.id)]);
  return (
    <>
      <PageHeader title="Journal" subtitle="Optional, whenever it helps. No streaks, no prompts you didn't ask for." />
      <JournalView entries={entries} aiCanRead={settings.externalAiConsent && settings.aiScopes.JOURNAL} />
    </>
  );
}
