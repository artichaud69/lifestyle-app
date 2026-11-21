import { requirePageUser } from "@/server/auth/current";
import { listProjects } from "@/server/modules/projects/service";
import { listCuriosity } from "@/server/modules/curiosity/service";
import { listGoals } from "@/server/modules/goals/service";
import { PageHeader } from "@/components/ui/primitives";
import { ProjectsView } from "@/components/projects/ProjectsView";

export const metadata = { title: "Projects" };

export default async function ProjectsPage() {
  const user = await requirePageUser();
  const [projects, curiosity, goals] = await Promise.all([listProjects(user.id), listCuriosity(user.id), listGoals(user.id, { status: "ACTIVE" })]);
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Projects" subtitle="Things to build, learn, make or explore — work and play alike. Picking one just because it's fun is a good reason." />
      <ProjectsView projects={projects} curiosity={curiosity} goals={goals.map((g) => ({ id: g.id, title: g.title }))} />
    </div>
  );
}
