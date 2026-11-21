import { NextResponse } from "next/server";
import { deleteAccountInput } from "@/lib/schemas/account";
import { authed, readJson } from "@/server/http";
import { deleteAccount } from "@/server/modules/account/service";
import { SESSION_COOKIE } from "@/server/auth/session";

export const POST = authed(
  async ({ req, user }) => {
    const { password } = await readJson(req, deleteAccountInput);
    await deleteAccount(user.id, password);
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(SESSION_COOKIE);
    return res;
  },
  { limit: 5 },
);
