import { requirePageUser } from "@/server/auth/current";
import { listMemories } from "@/server/modules/memory/service";
import { PageHeader } from "@/components/ui/primitives";
import { MemoryView } from "@/components/life/MemoryView";

export const metadata = { title: "Memory" };

export default async function MemoryPage() {
  const user = await requirePageUser();
  const memories = await listMemories(user.id, { includeRejected: true });
  return (
    <>
      <PageHeader
        title="What LIFE OS remembers"
        subtitle="Everything the system holds about you, where it came from, and whether it's your statement or an inference. Correct, hide or delete anything."
      />
      <MemoryView memories={memories.map(({ sources, ...m }) => ({ ...m, sourceCount: sources.length }))} />
    </>
  );
}
