import { AppError } from "@/lib/errors";
import { isDateKey } from "@/lib/dates";
import { planUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { getOrCreatePlan, updatePlan } from "@/server/modules/planning/service";

function date(raw: string) {
  if (!isDateKey(raw)) throw new AppError("VALIDATION", "Date must be YYYY-MM-DD");
  return raw;
}

export const GET = authed<{ date: string }>(async ({ user, params }) => ({ plan: await getOrCreatePlan(user.id, date(params.date)) }));
export const PATCH = authed<{ date: string }>(async ({ req, user, params }) => ({
  plan: await updatePlan(user.id, date(params.date), await readJson(req, planUpdate)),
}));
