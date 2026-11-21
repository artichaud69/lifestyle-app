import { requirePageUser } from "@/server/auth/current";
import { getSettings } from "@/server/modules/settings/service";
import { AppShell } from "@/components/shell/AppShell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePageUser();
  const settings = await getSettings(user.id);
  return (
    <AppShell displayName={user.displayName} recoveryMode={settings.recoveryMode}>
      {children}
    </AppShell>
  );
}
