import { requirePageUser } from "@/server/auth/current";
import { listGoals } from "@/server/modules/goals/service";
import { listDomains } from "@/server/modules/domains/service";
import { PageHeader } from "@/components/ui/primitives";
import { GoalsBoard } from "@/components/life/GoalsBoard";

export const metadata = { title: "Goals" };

export default async function GoalsPage() {
  const user = await requirePageUser();
  const [goals, domains] = await Promise.all([listGoals(user.id), listDomains(user.id)]);
  return (
    <>
      <PageHeader title="Goals" subtitle="Outcomes you're working toward, and why they matter. Releasing a goal is a valid outcome too." />
      <GoalsBoard goals={goals} domains={domains.map((d) => ({ key: d.key, name: d.name }))} />
    </>
  );
}
