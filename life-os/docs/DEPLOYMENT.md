# Deployment

LIFE OS is a standard Next.js Node server plus PostgreSQL 14+. It is **not** a
static site, so it cannot be served from GitHub Pages like the habit tracker in
this repository.

## Requirements

- Node.js 22
- PostgreSQL 14+ (managed: Neon, Supabase, RDS, Cloud SQL, Fly Postgres…) with encryption at rest and automated backups turned on
- A single application instance (see "Scaling")

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | Postgres connection string, with `sslmode=require` for managed databases. |
| `APP_ORIGIN` | yes | Public origin, e.g. `https://life.example.com`. Used for the CSRF Origin check. |
| `COOKIE_SECURE` | yes in production | `true`, so session cookies are sent over HTTPS only. |
| `AI_PROVIDER` | no | `anthropic` (default) or `none`. |
| `ANTHROPIC_API_KEY` | no | Without it, AI features run in their local/offline modes. Store it in the platform's secret manager. |
| `AI_MODEL` | no | Defaults to `claude-opus-5-5`. |

## Steps

```bash
npm ci
npx prisma migrate deploy      # applies versioned migrations; never destructive
npm run build
npm start                      # or: next start -p $PORT
```

Run `prisma migrate deploy` as a release step before new instances start.

### Example: a container platform (Fly.io, Railway, Render)

- Build command: `npm ci && npx prisma generate && npm run build`
- Release command: `npx prisma migrate deploy`
- Start command: `npm start`
- Set the variables above as secrets. Terminate TLS at the platform.

### Example: Vercel + managed Postgres

Works as-is (route handlers run as Node functions). Two caveats: the in-memory
rate limiter is per function instance, so move it to Redis (Upstash) first, and
use a pooled connection string for Prisma.

## Scaling

The in-memory rate limiter assumes one process. Before running several
instances, replace `src/server/security/rateLimit.ts` with a Redis-backed
implementation (same function signature).

## Operations

- Backups: enable point-in-time recovery on the managed database. Test a
  restore at least once.
- Logs: application logs contain no personal content by design. Keep it that
  way when adding logging.
- Upgrades: `npm run test` (needs `TEST_DATABASE_URL`) and `npm run test:e2e` before deploying.
