import { domainUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { updateDomain } from "@/server/modules/domains/service";

export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  domain: await updateDomain(user.id, params.id, await readJson(req, domainUpdate)),
}));
