import type { Prisma } from "@prisma/client";
import { AppError, notFound } from "@/lib/errors";
import { localDateKey, weekday as weekdayOf, type DateKey } from "@/lib/dates";
import {
  captureProposal,
  classification as classificationSchema,
  type AiClassificationOutput,
  type CaptureProposal,
  type Classification,
} from "@/lib/schemas/capture";
import { db } from "../../db";
import { audit } from "../../audit";
import { getAiAccess } from "../settings/service";
import { classifyWithRules } from "./rulesClassifier";
import { createTask } from "../tasks/service";
import { createJournalEntry } from "../journal/service";
import { createGoal } from "../goals/service";
import { createProject } from "../projects/service";
import { createCuriosity } from "../curiosity/service";
import { addPlanItem } from "../planning/service";
import { createMemory } from "../memory/service";

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Converts the flat LLM output into a validated proposal. Returns null if the
 * model's answer does not survive validation, so the caller can fall back to
 * the rules classifier rather than store something malformed.
 */
export function fromAiOutput(out: AiClassificationOutput, rawText: string, today: DateKey): Classification | null {
  const title = out.title?.trim() || rawText;
  const candidate = (() => {
    switch (out.type) {
      case "task":
        return { type: "task", title, dueDate: out.dueDate, estimateMinutes: out.minutes ? Math.round(out.minutes) : null, effort: null };
      case "journal":
        return { type: "journal", body: out.body?.trim() || rawText, tags: [] };
      case "goal":
        return { type: "goal", title, domainKey: out.domainKey, motivation: null };
      case "project":
        return { type: "project", title, purpose: null, kind: out.projectKind ?? "PERSONAL" };
      case "curiosity":
        return { type: "curiosity", question: out.question?.trim() || rawText, theme: null };
      case "leisure":
        return { type: "leisure", label: title, date: out.dueDate ?? today, minutes: out.minutes ? Math.round(out.minutes) : null };
      case "memory":
        return { type: "memory", content: out.body?.trim() || rawText, domainKey: out.domainKey };
    }
  })();
  const parsed = classificationSchema.safeParse({
    proposal: candidate,
    confidence: Math.min(1, Math.max(0, out.confidence)),
    rationale: out.rationale.slice(0, 500),
    alternatives: out.alternatives.filter((a) => a !== out.type).slice(0, 3),
  });
  return parsed.success ? parsed.data : null;
}

export type CaptureView = Awaited<ReturnType<typeof toView>>;

function toView(c: Prisma.CaptureGetPayload<object>) {
  const proposal = captureProposal.safeParse(c.proposal);
  const meta = (c.proposal as { _meta?: { rationale?: string; alternatives?: string[] } })?._meta ?? {};
  return {
    id: c.id,
    rawText: c.rawText,
    status: c.status,
    classifier: c.classifier,
    confidence: c.confidence,
    proposal: proposal.success ? proposal.data : null,
    rationale: meta.rationale ?? "",
    alternatives: meta.alternatives ?? [],
    resultType: c.resultType,
    resultId: c.resultId,
    createdAt: c.createdAt,
  };
}

/** Step 1–2 of the pipeline: capture and classify. Nothing is filed yet. */
export async function createCapture(userId: string, text: string) {
  const access = await getAiAccess(userId);
  const today = localDateKey(access.timezone);

  let result: Classification | null = null;
  let classifier: "AI" | "RULES" = "RULES";
  let aiError: string | null = null;

  if (access.provider) {
    try {
      const out = await access.provider.classify({ text, today, weekday: WEEKDAYS[weekdayOf(today)]! });
      result = fromAiOutput(out, text, today);
      if (result) classifier = "AI";
      else aiError = "AI classification failed validation";
    } catch (err) {
      aiError = err instanceof Error ? err.message : "AI unavailable";
    }
  }
  result ??= classifyWithRules(text, today);

  const capture = await db.capture.create({
    data: {
      userId,
      rawText: text,
      classifier,
      confidence: result.confidence,
      proposal: { ...result.proposal, _meta: { rationale: result.rationale, alternatives: result.alternatives } },
    },
  });
  return { ...toView(capture), aiError };
}

export async function listPendingCaptures(userId: string) {
  const rows = await db.capture.findMany({
    where: { userId, status: "PROPOSED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return rows.map(toView);
}

export async function listRecentCaptures(userId: string, take = 10) {
  const rows = await db.capture.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take });
  return rows.map(toView);
}

async function ownedPending(userId: string, id: string) {
  const c = await db.capture.findFirst({ where: { id, userId } });
  if (!c) throw notFound("Capture");
  if (c.status !== "PROPOSED") throw new AppError("CONFLICT", "This capture has already been filed or discarded");
  return c;
}

/**
 * Step 4–5: the user confirmed (possibly edited) the proposal. Creates the
 * structured record and links it back to the capture for provenance — all in
 * one transaction, so a failure leaves the capture pending, not half-filed.
 */
export async function confirmCapture(userId: string, captureId: string, proposal: CaptureProposal) {
  const capture = await ownedPending(userId, captureId);
  const extra = { captureId };

  const { resultType, resultId } = await db.$transaction(async (tx) => {
    let resultId: string;
    switch (proposal.type) {
      case "task":
        resultId = (
          await createTask(userId, { title: proposal.title, dueDate: proposal.dueDate, estimateMinutes: proposal.estimateMinutes, effort: proposal.effort }, extra, tx)
        ).id;
        break;
      case "journal":
        resultId = (await createJournalEntry(userId, { body: proposal.body, tags: proposal.tags }, extra, tx)).id;
        break;
      case "goal":
        resultId = (await createGoal(userId, { title: proposal.title, domainKey: proposal.domainKey, motivation: proposal.motivation }, extra, tx)).id;
        break;
      case "project":
        resultId = (await createProject(userId, { title: proposal.title, purpose: proposal.purpose, kind: proposal.kind, status: "IDEA" }, extra, tx)).id;
        break;
      case "curiosity":
        resultId = (await createCuriosity(userId, { question: proposal.question, theme: proposal.theme }, extra, tx)).id;
        break;
      case "leisure":
        resultId = (await addPlanItem(userId, proposal.date, { kind: "LEISURE", label: proposal.label, minutes: proposal.minutes }, extra, tx)).id;
        break;
      case "memory":
        resultId = (
          await createMemory(
            userId,
            { content: proposal.content, layer: "PROFILE", domainKey: proposal.domainKey, status: "USER_STATED" },
            { type: "CAPTURE", id: captureId, excerpt: capture.rawText },
            tx,
          )
        ).id;
        break;
    }
    await tx.capture.update({
      where: { id: captureId },
      data: { status: "CONFIRMED", resultType: proposal.type, resultId, resolvedAt: new Date() },
    });
    return { resultType: proposal.type, resultId };
  });

  await audit(userId, "capture.confirm", { type: "Capture", id: captureId }, { resultType, edited: !sameType(capture.proposal, proposal) });
  return { captureId, resultType, resultId, href: hrefFor(resultType, resultId) };
}

function sameType(stored: Prisma.JsonValue, proposal: CaptureProposal) {
  return (stored as { type?: string })?.type === proposal.type;
}

export async function discardCapture(userId: string, captureId: string) {
  await ownedPending(userId, captureId);
  await db.capture.update({ where: { id: captureId }, data: { status: "DISCARDED", resolvedAt: new Date() } });
}

export function hrefFor(type: string, id: string) {
  switch (type) {
    case "task":
      return `/today#task-${id}`;
    case "journal":
      return `/life/journal#entry-${id}`;
    case "goal":
      return `/life/goals#goal-${id}`;
    case "project":
      return `/projects#project-${id}`;
    case "curiosity":
      return `/projects#curiosity-${id}`;
    case "leisure":
      return `/today`;
    case "memory":
      return `/memory#memory-${id}`;
    default:
      return "/";
  }
}
