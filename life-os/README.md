# LIFE OS

A private, AI-native personal operating system: capture anything, keep goals,
projects and plans coherent, reflect, and ask an advisor that reasons over your
own records — while leisure, rest and family count as real priorities, not
lost productivity.

This folder is a standalone Next.js app inside the `lifestyle-app` repository.
It does not share code or deployment with the habit tracker or gym tracker.

**Status: Phase 1 (functional foundation).** What is built, what is partial and
what is next is listed in [docs/BLUEPRINT.md](docs/BLUEPRINT.md).

## What works today

- **Quick capture** (Home, or ⌘K anywhere): free text is sorted into a task,
  journal entry, goal, project idea, curiosity question, chosen leisure, or a
  statement about you. You confirm or change it before anything is saved.
- **Today**: one main focus, up to three optional items, commitments, chosen
  leisure and recovery; energy check-in; tasks with inline editing and undo.
- **Life**: life areas with self-reported status (no scores), goals with
  motivation and milestones, an optional journal, values.
- **Memory**: everything the system knows about you, where each item came from,
  and whether you said it or it was inferred. Confirm, correct, hide from AI or
  delete.
- **Advisor**: six roles; answers grounded in your records, with the exact
  records listed under each answer.
- **Settings**: recovery mode, quiet mode, AI consent and per-area AI access,
  signed-in devices, full JSON export, account deletion.
- **Works without AI.** With no API key or no consent, capture uses local
  rules and the advisor shows the relevant records, clearly labelled as not an
  AI answer.

## Local setup

Requirements: Node 22 and PostgreSQL 14+.

```bash
cd life-os
cp .env.example .env            # edit DATABASE_URL if needed
npm install

# create databases (example for a local Postgres superuser)
createdb lifeos_dev && createdb lifeos_test

npx prisma migrate deploy       # apply migrations to lifeos_dev
npm run db:seed                 # optional: SAMPLE account (development only)
npm run dev                     # http://localhost:3000
```

The seed creates `sample@lifeos.local` / `sample-data-only-123` with clearly
fictional data. It refuses to run when `NODE_ENV=production`.

To enable AI features, set `ANTHROPIC_API_KEY` in `.env`, then turn on
**Settings → AI & privacy → Allow sending records to the AI provider**.

## Tests

```bash
npm run typecheck
npm test                        # unit + integration (integration uses TEST_DATABASE_URL and truncates it)
npm run build && npm run test:e2e   # Playwright against the production build (uses a lifeos_e2e database)
npm run eval:ai -- --yes        # optional: real-model behaviour checks (billed API calls)
```

If Playwright can't find its browser, point it at a local Chromium:
`PW_CHROMIUM_PATH=/path/to/chrome npm run test:e2e`.

## Documentation

- [BLUEPRINT](docs/BLUEPRINT.md): Phase 1 plan, screens, backlog, acceptance criteria
- [ARCHITECTURE](docs/ARCHITECTURE.md): module boundaries and request lifecycle
- [AI_MEMORY](docs/AI_MEMORY.md): memory model, pipeline, retrieval, prompts
- [SECURITY](docs/SECURITY.md): threat boundaries, auth, privacy, known gaps
- [API](docs/API.md): endpoint reference
- [DATA_EXPORT](docs/DATA_EXPORT.md): export format
- [DEPLOYMENT](docs/DEPLOYMENT.md): production setup
