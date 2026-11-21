// Development seed: one clearly labelled SAMPLE account with realistic data.
// It never runs in production and never touches other accounts.
import "dotenv/config";
import { db } from "../src/server/db";
import { signup, completeOnboarding } from "../src/server/modules/account/service";
import { createGoal } from "../src/server/modules/goals/service";
import { createProject } from "../src/server/modules/projects/service";
import { createTask } from "../src/server/modules/tasks/service";
import { createJournalEntry } from "../src/server/modules/journal/service";
import { createValue } from "../src/server/modules/values/service";
import { createMemory } from "../src/server/modules/memory/service";
import { createCuriosity } from "../src/server/modules/curiosity/service";
import { addPlanItem } from "../src/server/modules/planning/service";
import { addDays, localDateKey } from "../src/lib/dates";

const EMAIL = "sample@lifeos.local";
const PASSWORD = "sample-data-only-123";

async function main() {
  if (process.env.NODE_ENV === "production") throw new Error("Refusing to seed sample data in production");
  if (await db.user.findUnique({ where: { email: EMAIL } })) {
    console.log(`Sample account already exists (${EMAIL}). Delete it in Settings to re-seed.`);
    return;
  }
  const user = await signup({ email: EMAIL, password: PASSWORD, displayName: "Sample User" });
  const id = user.id;
  await completeOnboarding(id, {
    displayName: "Sample User",
    usageReasons: ["Plan my days and weeks realistically", "Make room for things I enjoy"],
    activeDomains: ["achievement", "health", "relationships", "learning", "recreation", "finance", "autonomy", "identity"],
    priorities: ["Recover after a demanding quarter-end close", "More one-to-one time with each child"],
    interfaceMode: "STANDARD",
    externalAiConsent: false,
    aiScopes: ["PROFILE", "GOALS", "PLANNING", "MEMORY"],
  });

  const today = localDateKey("Europe/Amsterdam");
  for (const [name, description] of [
    ["Autonomy", "Choosing how I spend my time and how I do my work."],
    ["Competence", "Doing hard things well, and getting better at them."],
    ["Curiosity", "Understanding how things work — history, psychology, systems."],
    ["Family", "Being present with my partner and children."],
  ] as const)
    await createValue(id, { name, description });

  const strength = await createGoal(id, { title: "Get stronger without getting injured", domainKey: "health", horizon: "ONE_YEAR", priority: 1, motivation: "Training is where my head clears." });
  await createGoal(id, { title: "Run 8 km comfortably", domainKey: "health", horizon: "QUARTER", priority: 2 });
  const kids = await createGoal(id, { title: "Regular one-to-one time with each child", domainKey: "relationships", horizon: "OPEN", priority: 1, motivation: "They're small only once." });
  await createGoal(id, { title: "Build a six-month financial runway", domainKey: "finance", horizon: "ONE_YEAR", priority: 2 });

  const tool = await createProject(id, { title: "Running analysis tool", purpose: "See how pace and heart rate change over a training block.", kind: "LEARNING", status: "ACTIVE", nextAction: "Export the last 3 months of runs as CSV" });
  await createProject(id, { title: "Paint the Space Marine squad", kind: "CREATIVE", status: "ACTIVE", nextAction: "Base-coat the last two models" });
  await createProject(id, { title: "Minecraft: castle on the north ridge", kind: "RECREATION", status: "IDEA" });

  await createTask(id, { title: "Book the dentist", dueDate: today, priority: 2 });
  await createTask(id, { title: "Prepare Q4 forecast review", dueDate: addDays(today, 2), priority: 1, estimateMinutes: 90 });
  await createTask(id, { title: "Plan a Saturday morning with Léa", dueDate: addDays(today, 3), goalId: kids.id });
  await createTask(id, { title: "Clean up the run CSV parser", projectId: tool.id });
  await createTask(id, { title: "Deload week: check training plan", goalId: strength.id, dueDate: addDays(today, 5) });

  await addPlanItem(id, today, { kind: "MAIN", label: "Finish forecast assumptions" });
  await addPlanItem(id, today, { kind: "COMMITMENT", label: "School pick-up 15:30" });
  await addPlanItem(id, today, { kind: "LEISURE", label: "Minecraft, no guilt", minutes: 90 });

  await createJournalEntry(id, { body: "Good boxing session this morning. Felt clear-headed the rest of the day, even with the close.", mood: 4, occurredAt: new Date(Date.now() - 86_400_000).toISOString() });
  await createJournalEntry(id, { body: "Played two hours of Minecraft and then felt I should have worked. Not sure that feeling is fair.", mood: 3, tags: ["leisure"] });

  await createMemory(id, { content: "I work best on complex problems in the morning", layer: "PROFILE", domainKey: "achievement" }, { type: "USER", excerpt: "Sample data" });
  await db.memory.create({
    data: {
      userId: id,
      layer: "REFLECTIVE",
      status: "SPECULATIVE",
      confidence: 0.4,
      content: "Leisure may feel less restful when it isn't planned in advance",
      sources: { create: { sourceType: "USER", excerpt: "Sample hypothesis — not derived from real data" } },
    },
  });
  await createCuriosity(id, { question: "How did Roman logistics work?", theme: "history" });

  console.log(`Seeded SAMPLE account: ${EMAIL} / ${PASSWORD} (development only)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
