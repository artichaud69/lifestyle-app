import Link from "next/link";
import { requirePageUser } from "@/server/auth/current";
import { listDomains } from "@/server/modules/domains/service";
import { listGoals } from "@/server/modules/goals/service";
import { Card, CardTitle, PageHeader } from "@/components/ui/primitives";
import { DomainStatus } from "@/components/home/DomainStatus";

export const metadata = { title: "Life" };

export default async function LifePage() {
  const user = await requirePageUser();
  const [domains, goals] = await Promise.all([listDomains(user.id), listGoals(user.id, { status: "ACTIVE" })]);
  return (
    <>
      <PageHeader title="Life" subtitle="The parts of a good life, kept separate. None of them is a score." />
      <div className="grid gap-4 sm:grid-cols-2">
        {domains
          .filter((d) => d.isActive)
          .map((d) => {
            const dg = goals.filter((g) => g.domainId === d.id);
            return (
              <Card key={d.id}>
                <DomainStatus id={d.id} name={d.name} status={d.status} activeGoals={dg.length} />
                <p className="text-xs text-muted">{d.description}</p>
                {dg.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {dg.map((g) => (
                      <li key={g.id} className="text-sm">
                        <Link className="hover:underline" href={`/life/goals#goal-${g.id}`}>{g.title}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
      </div>
      {domains.some((d) => !d.isActive) && (
        <Card className="mt-6">
          <CardTitle hint="Hidden areas. Switch them back on in Identity & values.">Not tracked right now</CardTitle>
          <p className="text-sm text-muted">{domains.filter((d) => !d.isActive).map((d) => d.name).join(" · ")}</p>
        </Card>
      )}
    </>
  );
}
