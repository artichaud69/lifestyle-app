import { projectUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { archiveProject, getProject, updateProject } from "@/server/modules/projects/service";

export const GET = authed<{ id: string }>(async ({ user, params }) => ({ project: await getProject(user.id, params.id) }));
export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  project: await updateProject(user.id, params.id, await readJson(req, projectUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await archiveProject(user.id, params.id);
  return { ok: true };
});
