import { authed } from "@/server/http";
import { getDashboard } from "@/server/modules/dashboard/service";

export const GET = authed(async ({ user }) => getDashboard(user.id));
