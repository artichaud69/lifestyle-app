import { requirePageUser } from "@/server/auth/current";
import { getConversation, listConversations } from "@/server/modules/advisor/service";
import { getAiAccess } from "@/server/modules/settings/service";
import { AdvisorChat } from "@/components/advisor/AdvisorChat";

export const metadata = { title: "Advisor" };

export default async function AdvisorPage({ searchParams }: { searchParams: Promise<{ c?: string }> }) {
  const user = await requirePageUser();
  const { c } = await searchParams;
  const [conversations, access] = await Promise.all([listConversations(user.id), getAiAccess(user.id)]);
  const current = c ? await getConversation(user.id, c).catch(() => null) : null;
  return (
    <AdvisorChat
      key={current?.id ?? "new"}
      conversations={conversations.map((x) => ({ id: x.id, title: x.title, updatedAt: x.updatedAt }))}
      current={
        current
          ? {
              id: current.id,
              messages: current.messages.map((m) => ({ id: m.id, role: m.role, content: m.content, generator: m.generator, contextRefs: (m.contextRefs as never) ?? [] })),
            }
          : null
      }
      mode={access.mode}
      status={access.provider ? "ai" : access.providerConfigured ? "no-consent" : "not-configured"}
      scopes={access.scopes}
    />
  );
}
