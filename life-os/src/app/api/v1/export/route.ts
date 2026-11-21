import { NextResponse } from "next/server";
import { authed } from "@/server/http";
import { exportAll } from "@/server/modules/export/service";
import { localDateKey } from "@/lib/dates";

export const GET = authed(
  async ({ user }) => {
    const data = await exportAll(user.id);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="life-os-export-${localDateKey("UTC")}.json"`,
        "cache-control": "no-store",
      },
    });
  },
  { limit: 10 },
);
