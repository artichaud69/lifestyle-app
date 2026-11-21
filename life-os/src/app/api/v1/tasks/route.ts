import { taskCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { createTask, listTasks } from "@/server/modules/tasks/service";

export const GET = authed(async ({ req, user }) => {
  const status = req.nextUrl.searchParams.get("status");
  return { tasks: await listTasks(user.id, status === "TODO" || status === "DONE" ? { status } : {}) };
});
export const POST = authed(async ({ req, user }) => ({ task: await createTask(user.id, await readJson(req, taskCreate)) }));
