import { taskUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { archiveTask, updateTask } from "@/server/modules/tasks/service";

export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  task: await updateTask(user.id, params.id, await readJson(req, taskUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await archiveTask(user.id, params.id);
  return { ok: true, undo: `/api/v1/tasks/${params.id}/restore` };
});
