import { goalCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { createGoal, listGoals } from "@/server/modules/goals/service";

export const GET = authed(async ({ user }) => ({ goals: await listGoals(user.id) }));
export const POST = authed(async ({ req, user }) => ({ goal: await createGoal(user.id, await readJson(req, goalCreate)) }));
