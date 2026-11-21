import { onboardingInput } from "@/lib/schemas/account";
import { authed, readJson } from "@/server/http";
import { completeOnboarding } from "@/server/modules/account/service";

export const POST = authed(async ({ req, user }) => {
  await completeOnboarding(user.id, await readJson(req, onboardingInput));
  return { ok: true };
});
