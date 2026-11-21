import { requirePageUser } from "@/server/auth/current";
import { getSettings } from "@/server/modules/settings/service";
import { listSessions } from "@/server/auth/session";
import { getAiProvider } from "@/server/ai";
import { PageHeader } from "@/components/ui/primitives";
import { SettingsView } from "@/components/settings/SettingsView";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requirePageUser();
  const [settings, sessions] = await Promise.all([getSettings(user.id), listSessions(user.id)]);
  const provider = getAiProvider();
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Settings" />
      <SettingsView
        displayName={user.displayName}
        email={user.email}
        settings={{
          interfaceMode: settings.interfaceMode,
          theme: settings.theme,
          timezone: settings.timezone,
          weekStartsOn: settings.weekStartsOn,
          recoveryMode: settings.recoveryMode,
          quietMode: settings.quietMode,
          proactiveInsights: settings.proactiveInsights,
          externalAiConsent: settings.externalAiConsent,
          aiScopes: settings.aiScopes,
        }}
        providerId={provider?.id ?? null}
        sessions={sessions.map((s) => ({ ...s, current: s.id === user.sessionId }))}
      />
    </div>
  );
}
