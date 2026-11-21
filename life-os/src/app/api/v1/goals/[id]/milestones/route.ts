import { milestoneCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { addMilestone } from "@/server/modules/goals/service";

export const POST = authed<{ id: string }>(async ({ req, user, params }) => ({
  milestone: await addMilestone(user.id, params.id, await readJson(req, milestoneCreate)),
}));
