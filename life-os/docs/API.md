# API reference (v1)

Base path `/api/v1`. JSON in, JSON out. Authentication uses the `lifeos_session`
cookie set by `/api/auth/*`. Mutating requests (POST, PATCH, PUT) must send
`Content-Type: application/json` and come from the app's own origin.

Errors: `{ "error": { "code": "VALIDATION" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "RATE_LIMITED" | "AI_UNAVAILABLE" | "INTERNAL", "message": "...", "details"?: {...} } }`.
A resource that belongs to another user returns `404`.

Request schemas are the zod schemas in `src/lib/schemas/` (named in brackets
below).

## Auth
| Method | Path | Body | Notes |
| --- | --- | --- | --- |
| POST | `/api/auth/signup` | `{email, password, displayName}` [`signupInput`] | Sets the cookie. Returns `{next: "/onboarding"}`. |
| POST | `/api/auth/login` | `{email, password}` [`loginInput`] | Rate-limited per IP and per account. |
| POST | `/api/auth/logout` | `{}` | Revokes the current session. |
| POST | `/onboarding` | [`onboardingInput`] | Name, reasons, active areas, priorities → WORKING memories, density, AI consent, scopes. |

## Capture (the vertical slice)
| Method | Path | Body / result |
| --- | --- | --- |
| POST | `/captures` | `{text}` → `{capture: {id, rawText, classifier: "AI"\|"RULES", confidence, proposal, rationale, alternatives, aiError}}`. Nothing is filed yet. |
| GET | `/captures` | Pending (unfiled) captures. |
| POST | `/captures/:id/confirm` | `{proposal}` [`confirmCaptureInput`]; the proposal may be edited or change type → `{resultType, resultId, href}`. Returns `409` if already resolved. |
| POST | `/captures/:id/discard` | `{}` |

`proposal` is a discriminated union on `type`:
`task {title, dueDate, estimateMinutes, effort}` · `journal {body, tags}` ·
`goal {title, domainKey, motivation}` · `project {title, purpose, kind}` ·
`curiosity {question, theme}` · `leisure {label, date, minutes}` ·
`memory {content, domainKey}`.

## Records
| Resource | Endpoints |
| --- | --- |
| Tasks | `GET/POST /tasks` (`?status=TODO\|DONE`) · `PATCH/DELETE /tasks/:id` (DELETE archives and returns an `undo` URL) · `POST /tasks/:id/restore` |
| Goals | `GET/POST /goals` · `GET/PATCH/DELETE /goals/:id` · `POST /goals/:id/milestones` · `PATCH/DELETE /milestones/:id` |
| Projects | `GET/POST /projects` · `GET/PATCH/DELETE /projects/:id` |
| Journal | `GET/POST /journal` (`?cursor=`) · `GET/PATCH/DELETE /journal/:id` (DELETE is permanent and removes derived memories) |
| Curiosity | `PATCH/DELETE /curiosity/:id` (created through capture) |
| Values | `GET/POST /values` · `PATCH/DELETE /values/:id` |
| Life areas | `PATCH /domains/:id` (name, description, isActive, qualitative status) |
| Memories | `GET/POST /memories` (`?rejected=1`) · `GET /memories/:id` (explanation with resolved sources) · `PATCH /memories/:id` (`content`, `verdict: confirm\|reject`, `excludedFromAi`, `sensitivity`) · `DELETE /memories/:id` |
| Daily plan | `GET/PATCH /plans/:date` (YYYY-MM-DD; created on first access) · `POST /plans/:date/items` · `PATCH/DELETE /plan-items/:id` (`done`, `aligned`, `label`, `minutes`) |

## Advisor
| Method | Path | Notes |
| --- | --- | --- |
| POST | `/advisor` | `{message, conversationId?, mode?}` → `{conversationId, message, contextRefs, generator, notice}`. `generator` is `"offline"` when no model was called. 20 requests per minute. |
| GET | `/advisor/conversations` | List. |
| GET/DELETE | `/advisor/conversations/:id` | Full conversation with stored context refs / delete. |

## Settings, sessions, data
| Method | Path | Notes |
| --- | --- | --- |
| GET/PATCH | `/settings` | [`settingsUpdate`]: density, theme, timezone, week start, recovery, quiet, proactive, advisor mode, `externalAiConsent`, `aiScopes` (partial). |
| GET/DELETE | `/sessions` | List / sign out all other sessions. |
| DELETE | `/sessions/:id` | Revoke one session. |
| GET | `/export` | Download a JSON export (see DATA_EXPORT.md). |
| POST | `/account/delete` | `{password, confirm: "DELETE"}`. |
| GET | `/dashboard` | The same data the Home screen renders. |
