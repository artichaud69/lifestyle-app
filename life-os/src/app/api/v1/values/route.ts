import { valueCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { createValue, listValues } from "@/server/modules/values/service";

export const GET = authed(async ({ user }) => ({ values: await listValues(user.id) }));
export const POST = authed(async ({ req, user }) => ({ value: await createValue(user.id, await readJson(req, valueCreate)) }));
