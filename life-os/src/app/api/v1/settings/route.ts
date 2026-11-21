import { settingsUpdate } from "@/lib/schemas/account";
import { authed, readJson } from "@/server/http";
import { getSettings, updateSettings } from "@/server/modules/settings/service";

export const GET = authed(async ({ user }) => ({ settings: await getSettings(user.id) }));
export const PATCH = authed(async ({ req, user }) => ({ settings: await updateSettings(user.id, await readJson(req, settingsUpdate)) }));
