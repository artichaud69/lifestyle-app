import { Prisma } from "@prisma/client";
import type { AiScopeKey } from "@/lib/schemas/account";
import type { ContextRef } from "@/lib/schemas/advisor";
import { addDays, dateKeyToDate, dateToKey, localDateKey } from "@/lib/dates";
import { truncate } from "@/lib/utils";
import { db } from "../../db";

// Phase 1 retrieval: Postgres full-text search (GIN indexes, 'simple' config)
// plus a small "core" context that is always relevant (values, active goals,
// today's plan). Embeddings + pgvector slot in behind the same function in
// Phase 2 (see docs/AI_MEMORY.md). Every query is scoped by userId and by the
// AI scopes the user allowed; excluded/rejected records never reach a prompt.

export type ContextItem = { ref: ContextRef; text: string };
export type RetrievedContext = { core: ContextItem[]; matches: ContextItem[] };

const STOPWORDS = new Set(
  `a an the and or but if then so of to in on at for with about from by as is are was were be been being am do does did have has had
   i me my mine myself you your we our us it its this that these those what which who whom why how when where should could would can
   will shall may might must not no yes there here than too very just also into over under up down out off again more most some any
   all each few other such only own same both get got make made thing things really week today tomorrow
   le la les un une des et ou de du en au aux je tu il elle nous vous ils elles mon ma mes ce cet cette est sont pour par sur dans avec pas plus que qui quoi`.split(/\s+/),
);

/** Turns a free-text question into a safe OR-prefix tsquery string, or null. */
export function toTsQuery(text: string): string | null {
  const tokens = text
    .toLowerCase()
    .normalize("NFKC")
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter((t) => t.length > 2 && !STOPWORDS.has(t))
    .slice(0, 12);
  if (!tokens || tokens.length === 0) return null;
  // Tokens contain only letters/digits, so they cannot inject tsquery operators.
  return [...new Set(tokens)].map((t) => `${t}:*`).join(" | ");
}

const MEMORY_STATUS_LABEL: Record<string, string> = {
  USER_STATED: "you said",
  USER_CONFIRMED: "you confirmed",
  IMPORTED: "imported",
  AI_INFERENCE: "AI inference, unconfirmed",
  SPECULATIVE: "speculative hypothesis",
};

type Row = { id: string; text: string; extra: string | null; rank: number };

export async function retrieveContext(
  userId: string,
  question: string,
  scopes: Record<AiScopeKey, boolean>,
  opts: { timezone: string; perSource?: number } = { timezone: "UTC" },
): Promise<RetrievedContext> {
  const today = localDateKey(opts.timezone);
  const [core, matches] = await Promise.all([coreContext(userId, scopes, today), searchContext(userId, question, scopes, opts.perSource ?? 6)]);
  // Don't repeat an item already present in the core context.
  const seen = new Set(core.map((c) => `${c.ref.kind}:${c.ref.id}`));
  return { core, matches: matches.filter((m) => !seen.has(`${m.ref.kind}:${m.ref.id}`)) };
}

async function coreContext(userId: string, scopes: Record<AiScopeKey, boolean>, today: string): Promise<ContextItem[]> {
  const items: ContextItem[] = [];

  if (scopes.PROFILE) {
    const [values, profile] = await Promise.all([
      db.personalValue.findMany({ where: { userId }, orderBy: { sortOrder: "asc" }, take: 12 }),
      db.memory.findMany({
        where: { userId, layer: "PROFILE", excludedFromAi: false, supersededById: null, status: { notIn: ["REJECTED"] }, sensitivity: { not: "HIGHLY_SENSITIVE" } },
        orderBy: { updatedAt: "desc" },
        take: 15,
      }),
    ]);
    for (const v of values)
      items.push({ ref: { kind: "value", id: v.id, label: v.name }, text: `Value: ${v.name}${v.description ? ` — ${truncate(v.description, 200)}` : ""}` });
    for (const m of profile)
      items.push({
        ref: { kind: "memory", id: m.id, label: truncate(m.content, 80), status: m.status },
        text: `${truncate(m.content, 400)} (${MEMORY_STATUS_LABEL[m.status] ?? m.status})`,
      });
  }

  if (scopes.MEMORY) {
    const working = await db.memory.findMany({
      where: { userId, layer: "WORKING", excludedFromAi: false, supersededById: null, status: { notIn: ["REJECTED"] }, sensitivity: { not: "HIGHLY_SENSITIVE" } },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });
    for (const m of working)
      items.push({
        ref: { kind: "memory", id: m.id, label: truncate(m.content, 80), status: m.status },
        text: `${truncate(m.content, 400)} (current situation, ${MEMORY_STATUS_LABEL[m.status] ?? m.status})`,
      });
  }

  if (scopes.GOALS) {
    const [goals, projects] = await Promise.all([
      db.goal.findMany({
        where: { userId, status: "ACTIVE", archivedAt: null },
        include: { domain: { select: { name: true } } },
        orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
        take: 10,
      }),
      db.project.findMany({ where: { userId, status: "ACTIVE", archivedAt: null }, orderBy: { updatedAt: "desc" }, take: 10 }),
    ]);
    for (const g of goals)
      items.push({
        ref: { kind: "goal", id: g.id, label: g.title },
        text: `Active goal (priority ${g.priority}${g.domain ? `, ${g.domain.name}` : ""}${g.targetDate ? `, target ${dateToKey(g.targetDate)}` : ""}): ${g.title}${g.motivation ? ` — why: ${truncate(g.motivation, 200)}` : ""}`,
      });
    for (const p of projects)
      items.push({
        ref: { kind: "project", id: p.id, label: p.title },
        text: `Active project (${p.kind.toLowerCase()}): ${p.title}${p.nextAction ? ` — next: ${truncate(p.nextAction, 150)}` : ""}`,
      });
  }

  if (scopes.PLANNING) {
    const [plan, tasks] = await Promise.all([
      db.dailyPlan.findUnique({ where: { userId_date: { userId, date: dateKeyToDate(today) } }, include: { items: true } }),
      db.task.findMany({
        where: { userId, status: "TODO", archivedAt: null, dueDate: { lte: dateKeyToDate(addDays(today, 7)) } },
        orderBy: [{ dueDate: "asc" }, { priority: "asc" }],
        take: 15,
      }),
    ]);
    if (plan) {
      const parts = [
        plan.intention && `intention “${truncate(plan.intention, 200)}”`,
        plan.energy && `energy ${plan.energy.toLowerCase()}`,
        ...plan.items.map((i) => `${i.kind.toLowerCase()}: ${i.label}${i.minutes ? ` (${i.minutes} min)` : ""}${i.doneAt ? " [done]" : ""}`),
      ].filter(Boolean);
      if (parts.length)
        items.push({ ref: { kind: "plan", id: plan.id, label: `Plan for ${today}` }, text: `Today's plan (${today}): ${parts.join("; ")}` });
    }
    for (const t of tasks)
      items.push({
        ref: { kind: "task", id: t.id, label: t.title },
        text: `Open task: ${t.title}${t.dueDate ? ` (due ${dateToKey(t.dueDate)})` : ""}${t.postponedCount >= 2 ? ` (postponed ${t.postponedCount}×)` : ""}`,
      });
  }
  return items;
}

async function searchContext(userId: string, question: string, scopes: Record<AiScopeKey, boolean>, perSource: number): Promise<ContextItem[]> {
  const q = toTsQuery(question);
  if (!q) return [];
  const tsq = Prisma.sql`to_tsquery('simple', ${q})`;
  // Recency matters for personal context: halve the score every ~90 days.
  const recency = (col: Prisma.Sql) => Prisma.sql`(1.0 / (1.0 + EXTRACT(EPOCH FROM (now() - ${col})) / 7776000.0))`;
  const queries: Array<Promise<ContextItem[]>> = [];

  const run = (sql: Prisma.Sql, map: (r: Row) => ContextItem) => queries.push(db.$queryRaw<Row[]>(sql).then((rows) => rows.map(map)));

  if (scopes.PROFILE || scopes.MEMORY) {
    const layers = [...(scopes.PROFILE ? ["PROFILE"] : []), ...(scopes.MEMORY ? ["EPISODIC", "WORKING", "REFLECTIVE"] : [])];
    run(
      Prisma.sql`SELECT id, content AS text, status::text AS extra,
          ts_rank(to_tsvector('simple', content), ${tsq}) * ${recency(Prisma.sql`"updatedAt"`)} AS rank
        FROM "Memory"
        WHERE "userId" = ${userId} AND "excludedFromAi" = false AND "supersededById" IS NULL
          AND status <> 'REJECTED' AND sensitivity <> 'HIGHLY_SENSITIVE'
          AND layer::text IN (${Prisma.join(layers)})
          AND to_tsvector('simple', content) @@ ${tsq}
        ORDER BY rank DESC LIMIT ${perSource}`,
      (r) => ({
        ref: { kind: "memory", id: r.id, label: truncate(r.text, 80), status: r.extra ?? undefined, score: Number(r.rank) },
        text: `${truncate(r.text, 400)} (${MEMORY_STATUS_LABEL[r.extra ?? ""] ?? r.extra})`,
      }),
    );
  }
  if (scopes.JOURNAL) {
    run(
      Prisma.sql`SELECT id, coalesce(title || ': ', '') || body AS text, to_char("occurredAt", 'YYYY-MM-DD') AS extra,
          ts_rank(to_tsvector('simple', coalesce(title, '') || ' ' || body), ${tsq}) * ${recency(Prisma.sql`"occurredAt"`)} AS rank
        FROM "JournalEntry"
        WHERE "userId" = ${userId} AND "excludeFromAi" = false AND sensitivity <> 'HIGHLY_SENSITIVE'
          AND to_tsvector('simple', coalesce(title, '') || ' ' || body) @@ ${tsq}
        ORDER BY rank DESC LIMIT ${perSource}`,
      (r) => ({
        ref: { kind: "journal", id: r.id, label: `Journal ${r.extra}`, score: Number(r.rank) },
        text: `Journal entry ${r.extra}: ${truncate(r.text, 800)}`,
      }),
    );
  }
  if (scopes.GOALS) {
    run(
      Prisma.sql`SELECT id, title || coalesce(' — ' || motivation, '') AS text, status::text AS extra,
          ts_rank(to_tsvector('simple', title || ' ' || coalesce(description, '') || ' ' || coalesce(motivation, '')), ${tsq}) AS rank
        FROM "Goal"
        WHERE "userId" = ${userId} AND "archivedAt" IS NULL
          AND to_tsvector('simple', title || ' ' || coalesce(description, '') || ' ' || coalesce(motivation, '')) @@ ${tsq}
        ORDER BY rank DESC LIMIT ${perSource}`,
      (r) => ({ ref: { kind: "goal", id: r.id, label: truncate(r.text, 80), score: Number(r.rank) }, text: `Goal (${r.extra?.toLowerCase()}): ${truncate(r.text, 400)}` }),
    );
    run(
      Prisma.sql`SELECT id, title || coalesce(' — ' || purpose, '') AS text, status::text AS extra,
          ts_rank(to_tsvector('simple', title || ' ' || coalesce(purpose, '') || ' ' || coalesce(description, '')), ${tsq}) AS rank
        FROM "Project"
        WHERE "userId" = ${userId} AND "archivedAt" IS NULL
          AND to_tsvector('simple', title || ' ' || coalesce(purpose, '') || ' ' || coalesce(description, '')) @@ ${tsq}
        ORDER BY rank DESC LIMIT ${perSource}`,
      (r) => ({ ref: { kind: "project", id: r.id, label: truncate(r.text, 80), score: Number(r.rank) }, text: `Project (${r.extra?.toLowerCase()}): ${truncate(r.text, 400)}` }),
    );
    run(
      Prisma.sql`SELECT id, question AS text, status::text AS extra,
          ts_rank(to_tsvector('simple', question || ' ' || coalesce(notes, '')), ${tsq}) AS rank
        FROM "CuriosityItem"
        WHERE "userId" = ${userId} AND to_tsvector('simple', question || ' ' || coalesce(notes, '')) @@ ${tsq}
        ORDER BY rank DESC LIMIT ${perSource}`,
      (r) => ({ ref: { kind: "curiosity", id: r.id, label: truncate(r.text, 80), score: Number(r.rank) }, text: `Curiosity: ${truncate(r.text, 300)}` }),
    );
  }
  if (scopes.PLANNING) {
    run(
      Prisma.sql`SELECT id, title AS text, status::text || coalesce(' due ' || to_char("dueDate", 'YYYY-MM-DD'), '') AS extra,
          ts_rank(to_tsvector('simple', title || ' ' || coalesce(notes, '')), ${tsq}) * ${recency(Prisma.sql`"updatedAt"`)} AS rank
        FROM "Task"
        WHERE "userId" = ${userId} AND "archivedAt" IS NULL
          AND to_tsvector('simple', title || ' ' || coalesce(notes, '')) @@ ${tsq}
        ORDER BY rank DESC LIMIT ${perSource}`,
      (r) => ({ ref: { kind: "task", id: r.id, label: r.text, score: Number(r.rank) }, text: `Task (${r.extra?.toLowerCase()}): ${truncate(r.text, 300)}` }),
    );
  }

  const all = (await Promise.all(queries)).flat();
  return all.sort((a, b) => (b.ref.score ?? 0) - (a.ref.score ?? 0)).slice(0, 20);
}

/** Renders context for the prompt. Each item carries a citable [kind:id] tag. */
export function formatContext(ctx: RetrievedContext, maxChars = 24_000): string {
  const lines: string[] = [];
  const push = (heading: string, items: ContextItem[]) => {
    if (!items.length) return;
    lines.push(`## ${heading}`);
    for (const i of items) lines.push(`[${i.ref.kind}:${i.ref.id}] ${i.text}`);
    lines.push("");
  };
  push("Always-relevant context", ctx.core);
  push("Records matching the question", ctx.matches);
  const text = lines.join("\n");
  if (!text.trim()) return "No personal records are available for this question (either none exist yet or the user has not allowed access).";
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n[context truncated]` : text;
}

export function allRefs(ctx: RetrievedContext): ContextRef[] {
  return [...ctx.core, ...ctx.matches].map((i) => i.ref);
}
