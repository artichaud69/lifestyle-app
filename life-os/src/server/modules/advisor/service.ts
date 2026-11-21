import type { AdvisorMode } from "@prisma/client";
import { notFound } from "@/lib/errors";
import { localDateKey } from "@/lib/dates";
import { truncate } from "@/lib/utils";
import type { ContextRef } from "@/lib/schemas/advisor";
import { db } from "../../db";
import { AiUnavailableError, type ChatTurn } from "../../ai";
import { ADVISOR_BASE, MODE_STYLE } from "../../ai/prompts";
import { getAiAccess, getSettings } from "../settings/service";
import { allRefs, formatContext, retrieveContext, type RetrievedContext } from "../retrieval/service";

const HISTORY_TURNS = 12;

export function buildSystemPrompt(opts: { mode: AdvisorMode; displayName: string; today: string; recoveryMode: boolean }) {
  return [
    ADVISOR_BASE,
    MODE_STYLE[opts.mode] ?? "",
    `The person's preferred name is ${opts.displayName}. Today is ${opts.today}.`,
    opts.recoveryMode
      ? "The person has switched on recovery mode: they have reduced capacity right now. Favour rest and what is manageable, keep suggestions few and gentle, make postponing easy, and do not push for improvement."
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** Answer used when no model may or can be called. Honest about what it is. */
export function offlineAnswer(ctx: RetrievedContext, reason: string): string {
  const items = [...ctx.matches, ...ctx.core].slice(0, 12);
  if (!items.length) {
    return `${reason}\n\nI also found no records related to this question yet. Capturing tasks, goals and reflections will give the advisor something to work with.`;
  }
  return `${reason}\n\nThese are the records LIFE OS would use to answer — most relevant first:\n\n${items
    .map((i) => `- ${truncate(i.text, 220)}`)
    .join("\n")}`;
}

export async function ask(userId: string, input: { conversationId?: string | null; message: string; mode?: AdvisorMode }) {
  const [access, settings, user] = await Promise.all([
    getAiAccess(userId),
    getSettings(userId),
    db.user.findUniqueOrThrow({ where: { id: userId }, select: { displayName: true } }),
  ]);
  const mode = input.mode ?? settings.advisorMode;

  let conversation = input.conversationId
    ? await db.aIConversation.findFirst({ where: { id: input.conversationId, userId } })
    : null;
  if (input.conversationId && !conversation) throw notFound("Conversation");
  conversation ??= await db.aIConversation.create({ data: { userId, title: truncate(input.message, 80), mode } });

  const previous = await db.aIMessage.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "desc" },
    take: HISTORY_TURNS,
  });
  await db.aIMessage.create({ data: { conversationId: conversation.id, role: "USER", content: input.message } });

  const ctx = await retrieveContext(userId, input.message, access.scopes, { timezone: access.timezone });
  const refs: ContextRef[] = allRefs(ctx);

  let content: string;
  let generator: string;
  let notice: string | null = null;

  if (access.provider) {
    try {
      const history: ChatTurn[] = previous.reverse().map((m) => ({ role: m.role === "USER" ? "user" : "assistant", content: m.content }));
      content = await access.provider.advise({
        system: buildSystemPrompt({ mode, displayName: user.displayName, today: localDateKey(access.timezone), recoveryMode: settings.recoveryMode }),
        context: formatContext(ctx),
        history,
        question: input.message,
      });
      generator = access.provider.id;
    } catch (err) {
      const reason = err instanceof AiUnavailableError ? err.message : "The AI service is unavailable right now";
      notice = reason;
      content = offlineAnswer(ctx, `I couldn't reach the AI model (${reason}), so this is not an AI answer.`);
      generator = "offline";
    }
  } else {
    const reason = !access.providerConfigured
      ? "AI answers are not configured on this server, so this is not an AI answer."
      : "You haven't allowed LIFE OS to send your records to the AI provider (Settings → AI & privacy), so this is not an AI answer.";
    notice = reason;
    content = offlineAnswer(ctx, reason);
    generator = "offline";
  }

  const message = await db.aIMessage.create({
    data: { conversationId: conversation.id, role: "ASSISTANT", content, contextRefs: refs, generator },
  });
  await db.aIConversation.update({ where: { id: conversation.id }, data: { updatedAt: new Date(), mode } });
  return { conversationId: conversation.id, message, contextRefs: refs, generator, notice };
}

export function listConversations(userId: string) {
  return db.aIConversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 50 });
}

export async function getConversation(userId: string, id: string) {
  const c = await db.aIConversation.findFirst({ where: { id, userId }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!c) throw notFound("Conversation");
  return c;
}

export async function deleteConversation(userId: string, id: string) {
  await getConversation(userId, id);
  await db.aIConversation.delete({ where: { id } });
}
