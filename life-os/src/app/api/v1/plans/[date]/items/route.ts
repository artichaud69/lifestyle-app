import { AppError } from "@/lib/errors";
import { isDateKey } from "@/lib/dates";
import { planItemCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { addPlanItem } from "@/server/modules/planning/service";

export const POST = authed<{ date: string }>(async ({ req, user, params }) => {
  if (!isDateKey(params.date)) throw new AppError("VALIDATION", "Date must be YYYY-MM-DD");
  return { item: await addPlanItem(user.id, params.date, await readJson(req, planItemCreate)) };
});
