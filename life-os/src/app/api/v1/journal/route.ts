import { journalCreate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { createJournalEntry, listJournalEntries } from "@/server/modules/journal/service";

export const GET = authed(async ({ req, user }) => ({
  entries: await listJournalEntries(user.id, { cursor: req.nextUrl.searchParams.get("cursor") ?? undefined }),
}));
export const POST = authed(async ({ req, user }) => ({ entry: await createJournalEntry(user.id, await readJson(req, journalCreate)) }));
