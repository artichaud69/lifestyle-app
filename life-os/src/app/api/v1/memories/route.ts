import { memoryCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { createMemory, listMemories } from "@/server/modules/memory/service";

export const GET = authed(async ({ req, user }) => ({
  memories: await listMemories(user.id, { includeRejected: req.nextUrl.searchParams.get("rejected") === "1" }),
}));
export const POST = authed(async ({ req, user }) => ({
  memory: await createMemory(user.id, await readJson(req, memoryCreate), { type: "USER", excerpt: "Added on the memory screen" }),
}));
