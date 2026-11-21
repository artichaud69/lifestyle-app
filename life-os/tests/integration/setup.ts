import { afterAll, beforeEach } from "vitest";

// Integration tests run against a real Postgres (TEST_DATABASE_URL), never the dev DB.
const url = process.env.TEST_DATABASE_URL ?? "postgresql://lifeos:lifeos@localhost:5432/lifeos_test";
if (!url.includes("test")) throw new Error("Refusing to run integration tests against a non-test database");
process.env.DATABASE_URL = url;
process.env.AI_PROVIDER = "none";

const { db } = await import("@/server/db");
const { resetRateLimits } = await import("@/server/security/rateLimit");
const { setAiProviderForTests } = await import("@/server/ai");

beforeEach(async () => {
  const tables = await db.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`;
  await db.$executeRawUnsafe(`TRUNCATE ${tables.map((t) => `"${t.tablename}"`).join(", ")} CASCADE`);
  resetRateLimits();
  setAiProviderForTests(undefined);
});

afterAll(async () => {
  await db.$disconnect();
});
