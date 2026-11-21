import { requirePageUser } from "@/server/auth/current";
import { listValues } from "@/server/modules/values/service";
import { listDomains } from "@/server/modules/domains/service";
import { PageHeader } from "@/components/ui/primitives";
import { IdentityView } from "@/components/life/IdentityView";

export const metadata = { title: "Identity & values" };

export default async function IdentityPage() {
  const user = await requirePageUser();
  const [values, domains] = await Promise.all([listValues(user.id), listDomains(user.id)]);
  return (
    <>
      <PageHeader title="Identity & values" subtitle="What matters to you, in your own words. Personality assessments and the deeper self-model arrive in Phase 2." />
      <IdentityView values={values} domains={domains} />
    </>
  );
}
