import { journalUpdate } from "@/lib/schemas/records";
import { authed, readJson } from "@/server/http";
import { deleteJournalEntry, getJournalEntry, updateJournalEntry } from "@/server/modules/journal/service";

export const GET = authed<{ id: string }>(async ({ user, params }) => ({ entry: await getJournalEntry(user.id, params.id) }));
export const PATCH = authed<{ id: string }>(async ({ req, user, params }) => ({
  entry: await updateJournalEntry(user.id, params.id, await readJson(req, journalUpdate)),
}));
export const DELETE = authed<{ id: string }>(async ({ user, params }) => {
  await deleteJournalEntry(user.id, params.id);
  return { ok: true };
});
