# Architecture

## Shape

LIFE OS is a **modular monolith**: one deployable Next.js application. Module
boundaries are kept in code, not as separate services.

```
          ┌──────────────── src/app (delivery) ────────────────┐
 browser ─┤ pages (server components)     route handlers /api  │
          └──────────────┬────────────────────────┬────────────┘
                         │ call                   │ call (after authed())
          ┌──────────────▼──── src/server/modules ▼────────────┐
          │ capture  tasks  goals  projects  journal  memory   │
          │ planning curiosity values domains dashboard        │
          │ retrieval advisor settings account export          │
          └──────┬──────────────────────────────┬──────────────┘
                 │ Prisma                       │ AiProvider
          ┌──────▼──────┐                ┌──────▼──────────────┐
          │ PostgreSQL  │                │ src/server/ai        │
          └─────────────┘                │ anthropic | (none)   │
                                         └──────────────────────┘
          src/lib: zod schemas, dates, errors — shared by client and server
```

### Rules for the module boundaries

1. **Only services touch the database.** Pages and route handlers call service
   functions; they never import `db` for user data. The one exception is the
   root layout, which reads the theme preference.
2. **Every service function is user-scoped.** The first argument is `userId`,
   and every query filters on it. Linking to another record (a task's project,
   a plan item's task) re-checks that the user owns it.
3. **Modules call each other through exported functions.** Capture uses the
   create functions of tasks, journal and the other record modules (passing a
   transaction), never their tables directly.
4. **`src/lib` has no server dependencies.** Schemas and helpers there are used
   by both client and server, so validation is identical on both sides.
5. **The AI layer is reached only through `getAiAccess(userId)`**, which returns
   a provider only when one is configured *and* the user has consented.

## Request lifecycle (mutating API call)

1. `authed()` in `src/server/http.ts`:
   - checks the Origin header (CSRF) and requires a JSON content type;
   - validates the session cookie (`sha256(token)` lookup, not revoked, not
     expired; `lastSeenAt` refreshed at most every 15 minutes);
   - applies a per-user rate limit (tighter for capture and the advisor).
2. `readJson(req, schema)` parses the body and validates it with zod.
   Validation errors return 400 with field details.
3. The service runs its checks and writes, using a transaction where several
   writes must succeed or fail together.
4. `AppError` maps to a status code; any other error becomes a generic 500 and
   is logged on the server without being exposed to the client.

## Rendering

- Pages are **server components** that read through services and pass plain
  data to client components.
- Client components change data through `/api/v1/*`, then call
  `router.refresh()` to re-render the server components. There is no separate
  client cache to keep in sync. Small optimistic updates (ticking a checkbox)
  are rolled back if the request fails.
- Themes use CSS custom properties. `data-theme` on `<html>` comes from the
  user's setting; with "system", `prefers-color-scheme` decides.

## Background work

Phase 1 needs none: classification runs inline, because the user is waiting
for the proposal, and so does retrieval. These will move to a job queue (a
Postgres-backed queue first, Redis when needed) when they appear:

- embedding generation (Phase 2);
- memory extraction from journal entries and conversations (Phase 2);
- weekly review generation and calendar or health syncs (Phase 2–3).

## Why these choices

| Decision | Reason |
| --- | --- |
| Monolith, not services | One user, one data model, strong cross-module joins. Boundaries are enforced in code; it can be split later if needed. |
| Own session auth, not a hosted provider | Keeps the most sensitive data (who is signed in) inside the system and has no external dependency. Passkeys are next on the backlog. |
| Postgres full-text before pgvector | Works offline with no embedding provider, handles French and English, and is enough at Phase 1 data volumes. The retrieval interface is ready for hybrid search. |
| Rules classifier as baseline | Capture must work without consent or network. The AI improves accuracy but is never required. |
| Route handlers, not Server Actions, for mutations | An explicit, testable JSON API that native or mobile clients (Phase 5) can use too. |
