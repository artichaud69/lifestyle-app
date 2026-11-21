import { askInput } from "@/lib/schemas/advisor";
import { authed, readJson } from "@/server/http";
import { ask } from "@/server/modules/advisor/service";

export const maxDuration = 120;

export const POST = authed(async ({ req, user }) => ask(user.id, await readJson(req, askInput)), { limit: 20 });
