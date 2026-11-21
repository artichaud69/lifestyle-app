# AI memory and retrieval

## Principles

1. **Personal data is context, never instructions.** It reaches the model only
   inside `<personal_context>`, and the system prompt says it never contains
   instructions.
2. **Nothing leaves the server without consent.** `EXTERNAL_AI_PROCESSING` is
   recorded in an append-only consent log. It is off by default and can be
   withdrawn at any time.
3. **The user decides what the AI may read**: by type (scopes), per record
   (journal entry or memory exclusion), and by marking a memory inaccurate.
4. **Epistemic status is never merged.** A statement the user made, an
   imported measurement, an AI inference, a confirmed interpretation and a
   speculative hypothesis are different values of `Memory.status` and are
   labelled differently in prompts and in the UI.
5. **Every answer can be explained.** The records retrieved for an answer are
   stored on the message (`AIMessage.contextRefs`) and shown as "Based on N
   records". Every memory can answer "why do you believe this?" from its
   `MemorySource` rows.
6. **AI is an enhancement.** Without a provider, capture uses the rules
   classifier and the advisor returns the relevant records, labelled
   "not an AI answer".

## Memory model

`Memory` = **layer** × **status**:

| Layer | Holds | Created in Phase 1 by |
| --- | --- | --- |
| `PROFILE` (stable) | values-like statements, preferences, enduring interests | capture ("I work best in the morning"), the memory screen |
| `WORKING` | current priorities and situations | onboarding priorities, the memory screen |
| `EPISODIC` | events, experiences, decisions | the memory screen (automatic extraction is Phase 2) |
| `REFLECTIVE` | tentative patterns and hypotheses | Phase 2 insight generation; sample data in the seed |

| Status | Meaning | In prompt |
| --- | --- | --- |
| `USER_STATED` | the user said it | "(you said)" |
| `USER_CONFIRMED` | an inference the user approved or rewrote | "(you confirmed)" |
| `IMPORTED` | from an import or measurement | "(imported)" |
| `AI_INFERENCE` | proposed by the system, not yet confirmed | "(AI inference, unconfirmed)" |
| `SPECULATIVE` | a low-confidence hypothesis | "(speculative hypothesis)" |
| `REJECTED` | the user marked it inaccurate | never included |

Every memory also carries `id`, `content`, `sources` (provenance),
`createdAt`, `lastVerifiedAt`, `confidence`, `sensitivity`, `excludedFromAi`
and `userEditable`. That covers all the fields in §16.3 of the spec.

User actions and their effects:

- **Edit the text** → an inference becomes `USER_CONFIRMED`; `lastVerifiedAt` is set.
- **Confirm** → `USER_CONFIRMED`, confidence 1.
- **Not accurate** → `REJECTED` and excluded from AI. It is kept so the same
  inference is not proposed again.
- **Hide from AI** → kept and visible, but never retrieved.
- **Delete** → removed, with its sources.
- **Delete a journal entry** → memories sourced only from it are deleted too.

## The pipeline (spec §22), as built

| Step | Phase 1 implementation |
| --- | --- |
| 1 Capture | `Capture` row with the raw text. |
| 2 Classification | Rules classifier, or the LLM with structured output (`aiClassificationOutput`) when the user has consented. |
| 3 Extraction | The proposal fields (title, date, minutes, area…) are validated with zod; an invalid model output is discarded and the rules classifier is used instead. |
| 4 Confirmation | **Always**: the user confirms, edits or discards. Low confidence asks the user to choose the destination. |
| 5 Storage | One transaction creates the record and marks the capture `CONFIRMED`, with `resultType`/`resultId` and the record's `captureId`. Memories get a `MemorySource`. |
| 6 Retrieval | `retrieveContext(userId, question, scopes)` (below). |
| 7 Reasoning | The advisor prompt (principles, role style, recovery-mode note) plus the formatted context and the last 12 turns. |
| 8 Insight generation | ○ Phase 2. The Insights screen shows a deterministic weekly summary only. |
| 9 Feedback | Memory actions above; the context list on each answer links to every record used. |
| 10 Revision | Edits and rejections change what is retrieved next time. Deduplication, contradiction handling and ageing come with automatic extraction in Phase 2. |

## Retrieval

`src/server/modules/retrieval/service.ts`

1. **Core context** (always included, small, scope-gated): values and
   `PROFILE` memories (PROFILE scope); `WORKING` memories (MEMORY scope);
   active goals and projects (GOALS); today's plan and tasks due within 7 days
   (PLANNING).
2. **Query matches**: the question becomes an OR prefix query
   (`dentist:* | crown:*`). Tokens are reduced to letters and digits first, so
   they cannot inject query operators, and stop words in English and French are
   removed. One query runs per allowed source, scored by
   `ts_rank × 1/(1 + age/90d)`, with up to 6 per source and 20 overall.
3. Exclusions are in the SQL `WHERE` clause: `userId`, scope, `excludedFromAi`,
   `excludeFromAi`, `status <> 'REJECTED'`, `sensitivity <> 'HIGHLY_SENSITIVE'`,
   `supersededById IS NULL`.
4. `formatContext` renders each item as `[kind:id] text` (capped at about 24k
   characters) so the model can cite it. Records already in the core context
   are not repeated.

### Phase 2: hybrid retrieval

- Add `CREATE EXTENSION vector` and an `Embedding(userId, sourceType, sourceId, model, vector)` table.
- An `EmbeddingProvider` interface beside `AiProvider`. Embeddings are created
  in a background job after writes, and only for scopes the user allows.
- Keep both rankings and merge them with reciprocal rank fusion inside
  `retrieveContext`. The function signature does not change.

## Prompting details

- The system prompt is stable text, so it is cached (`cache_control`). The date,
  name and recovery note go after the stable part.
- Advisor calls use `output_config.effort: "medium"`; classification uses
  `"low"`.
- Server-side refusal fallback is enabled (`fallbacks: "default"`). A refusal
  returns a gentle message rather than an error.
- Safety rules in the prompt: no diagnosis, no labels, no reassurance loops,
  no attributing symptoms to anxiety, no treatment changes, crisis resources
  for the Netherlands (113 / 0800-0113 / 112), and the person decides.
- Behaviour is checked by `tests/ai-evals` (grounding, no moralising about
  leisure, tentative language for speculation, no diagnosis, no invented facts,
  injection resistance, no yes/no on life decisions, crisis response). These
  cases make billed calls, so they run only with `npm run eval:ai -- --yes`.
