import { projectCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { createProject, listProjects } from "@/server/modules/projects/service";

export const GET = authed(async ({ user }) => ({ projects: await listProjects(user.id) }));
export const POST = authed(async ({ req, user }) => ({ project: await createProject(user.id, await readJson(req, projectCreate)) }));
