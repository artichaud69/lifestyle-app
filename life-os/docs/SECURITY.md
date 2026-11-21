# Security and privacy model

LIFE OS holds some of the most sensitive data a person has. This document
describes what Phase 1 enforces and what is still open. It is an engineering
description, **not** a GDPR compliance claim; no formal assessment has been
done.

## Trust boundaries

| Boundary | Control |
| --- | --- |
| Browser → server | HTTPS in production (`COOKIE_SECURE=true`), session cookie `httpOnly` + `SameSite=Lax`, Origin check and JSON content type on mutating requests, strict CSP (`connect-src 'self'`, `frame-ancestors 'none'`), `nosniff`, `Referrer-Policy: same-origin`. |
| User → user | Every service filters on `userId`; cross-references are re-checked; a foreign id returns 404. Covered by `tests/integration/authorization.test.ts` and e2e test 3. |
| Server → AI provider | Only with recorded consent, only in-scope data, only through the server (keys never reach the client; the CSP would block a direct call anyway). |
| Imported or stored text → model | Delimited as `<personal_context>`; the system prompt says it is data; checked by the eval suite. |

## Authentication

- Passwords: scrypt (N=2^15, r=8, p=1, 64-byte key, 16-byte random salt), with
  the parameters encoded in the hash so they can be raised later. Minimum
  length 12. Login compares against a dummy hash when the email is unknown, so
  timing does not reveal which accounts exist.
- Sessions: a 256-bit random token in the cookie; only its SHA-256 is stored.
  30-day sliding expiry. Listed in Settings with device and last activity;
  revocable one at a time or "sign out other devices". Logout revokes the
  session on the server.
- Rate limits: login 20 per 15 min per IP and 8 per 15 min per account; sign-up
  10 per hour per IP; API 300 per minute per user (60 for capture, 20 for the
  advisor). **In-memory, so correct only for a single instance.** Move to Redis
  before scaling out.
- ○ Planned: passkeys (WebAuthn), optional TOTP, re-authentication for
  sensitive settings.

## Authorization

- Single-user ownership model in Phase 1. Every record has an owner and
  nothing is shared.
- AI permission levels (§16.9): Phase 1 implements **level 1** (read and
  summarise authorised data). The advisor cannot change anything: it has no
  tools. Levels 2–4 (drafts, approved changes, pre-authorised low-risk actions)
  will each need an explicit per-action confirmation UI and an audit entry.

## Data protection

- In transit: TLS, terminated by the platform (see DEPLOYMENT.md).
- At rest: relies on the database volume's encryption (managed Postgres
  providers encrypt at rest by default).
  ○ **Planned:** application-level envelope encryption for `JournalEntry.body`,
  `Memory.content` and future medical and financial tables, with keys in a KMS.
  It is not done yet because it also needs searchable-encryption or
  decrypt-then-index decisions for full-text retrieval.
- Sensitivity classes: `NORMAL`, `PERSONAL`, `SENSITIVE` (journal default),
  `HIGHLY_SENSITIVE` (never sent to AI in Phase 1).
- Audit log: logins and failures, sign-up, logout, session revocation, consent
  changes, AI-scope changes, capture confirmations, memory verdicts and
  deletions, journal deletions, export, account deletion. It records
  identifiers only, never content.
- Logging: server errors are logged without request bodies.

## User rights

- **Export:** `GET /api/v1/export` returns everything the user owns as
  documented JSON (DATA_EXPORT.md), without password or session hashes.
- **Deletion:** journal entries and memories are hard-deleted (along with
  derived memories); tasks, goals and projects are archived (Undo) and purged
  with the account. Account deletion requires the password and typing
  `DELETE`, and cascades to every owned row.
- **Consent:** withdrawable at any time; history kept in `UserConsent`.
- **Model training:** LIFE OS never uses personal data for training. Whether
  the AI provider may retain or train on API traffic is governed by the
  provider's terms. Commercial API terms generally exclude training, but check
  the current terms and retention settings for your account before enabling AI.

## Known gaps (tracked)

1. Application-level encryption at rest (above).
2. Passkeys and MFA.
3. Distributed rate limiting.
4. Backup and restore runbook; automated backups are a hosting setting today.
5. Automated retention policies (e.g. purge archived tasks after N days).
6. Secure file uploads. There are no uploads in Phase 1; Phase 2 imports will
   need type sniffing, size limits, malware scanning and object storage with
   signed URLs.
