import { authed } from "@/server/http";
import { listConversations } from "@/server/modules/advisor/service";

export const GET = authed(async ({ user }) => ({ conversations: await listConversations(user.id) }));
