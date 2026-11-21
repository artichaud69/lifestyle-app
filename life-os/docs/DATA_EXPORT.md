# Export format

`GET /api/v1/export` returns one JSON document:

```jsonc
{
  "format": "life-os-export",
  "version": 1,
  "exportedAt": "2026-11-21T10:00:00.000Z",
  "user":        { "id", "email", "displayName", "createdAt", "onboardedAt" },
  "settings":    { ...UserSettings },
  "consents":    [ { "kind", "granted", "version", "createdAt" } ],   // full history
  "aiPermissions": [ { "scope", "allowed" } ],
  "domains":     [ ...LifeDomain ],
  "values":      [ ...PersonalValue ],
  "goals":       [ ...Goal & { "milestones": [...] } ],
  "projects":    [ ...Project ],
  "tasks":       [ ...Task ],              // includes archived tasks
  "dailyPlans":  [ ...DailyPlan & { "items": [...] } ],
  "journalEntries": [ ...JournalEntry ],
  "curiosityItems": [ ...CuriosityItem ],
  "captures":    [ ...Capture ],           // raw text + proposal + what it became
  "memories":    [ ...Memory & { "sources": [...] } ],
  "conversations": [ ...AIConversation & { "messages": [...] } ]
}
```

Field names and enum values match `prisma/schema.prisma` exactly. Dates are
ISO 8601 strings; date-only fields (`dueDate`, `DailyPlan.date`) are UTC
midnight of the local date. Password hashes and session token hashes are never
exported. `version` will be bumped if the shape changes incompatibly.
