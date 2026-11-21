import { authed } from "@/server/http";
import { restoreTask } from "@/server/modules/tasks/service";

export const POST = authed<{ id: string }>(async ({ user, params }) => ({ task: await restoreTask(user.id, params.id) }));
