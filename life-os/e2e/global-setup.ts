import { execSync } from "node:child_process";

// Applies pending migrations (non-destructive). Tests never reset data: each
// one signs up a fresh, uniquely-named user, so runs don't interfere.
export default function globalSetup() {
  const url = process.env.E2E_DATABASE_URL ?? "postgresql://lifeos:lifeos@localhost:5432/lifeos_e2e";
  if (!url.includes("e2e")) throw new Error("Refusing to use a non-e2e database for end-to-end tests");
  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
}
