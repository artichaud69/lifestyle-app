# Gym Coach

A gym training tracker: plan your sessions, log your lifts, and get progression
suggestions and feedback from a built-in coach — no account, no API key, no
subscription. Everything runs in the browser and is stored on your device.

Standalone for now, on purpose — see [Integrating into lifestyle-app](#integrating-into-lifestyle-app)
for how it can move in later without a rewrite.

## Features

- **Plan** — answer three questions (goal, experience, days/week) and the coach
  builds a full program: Full Body, Upper/Lower, or Push/Pull/Legs, picked
  automatically from your training frequency. Edit any session afterwards —
  swap exercises, change sets/reps, or add your own custom movements.
- **Train** — start the next session in rotation (or a freeform workout with no
  plan at all), log weight/reps/RPE per set, see your last performance on that
  exercise inline, and get an automatic rest timer between sets.
- **Coach** — every set you log feeds back into the plan. Hit your targets and
  the next session's weight goes up; miss them and it holds or backs off; stall
  for three sessions in a row and it suggests a deload. This is the "AI" in the
  app — a deterministic, rule-based progressive-overload engine (double
  progression for hypertrophy/general work, linear progression with plateau
  detection for strength compounds), not a network call. It works fully
  offline and costs nothing to run.
- **Progress** — an estimated-1RM trend per exercise, personal records, and
  plateau alerts.
- **History** — every past workout, with full set-by-set detail.

It's a installable PWA (works offline, add-to-homescreen) styled after apps
like Hevy and Strong.

## Running it

```bash
cd gym-tracker
npm install
npm run dev       # starts a local dev server
npm test          # runs the coach-logic test suite
npm run build     # production build in dist/
```

There's no backend and no environment variables to set — `npm run dev` is the
whole setup.

## How the coach works

All of it lives in `src/lib/coach.js` and is pure, tested logic (`coach.test.js`,
`workout.test.js`):

- `generateProgram()` builds a program from a goal + experience + training
  frequency, using standard, well-established programming patterns (linear
  progression for beginners/strength, double progression for hypertrophy).
- `suggestNextTarget()` looks at your most recent logged sets for an exercise
  and proposes the next weight/rep target, with a one-line rationale.
- `analyzeWorkout()` runs right after you finish a session and produces the
  feedback cards (PR, stall, missed target, volume trend) shown in the
  workout summary.

Because it's just arithmetic over your own logged data, there's nothing to
sign up for and nothing that can rate-limit or charge you.

## Data

Everything is stored in `localStorage` under `gym-tracker.*` keys — your
program, logs, custom exercises, and settings. Nothing leaves the device.
There's no sync between devices yet (see below).

## Integrating into lifestyle-app

This was built to slot into the `lifestyle-app` habit tracker later without a
rewrite:

- Same stack (React + Vite + `vite-plugin-pwa`), same component conventions
  (`PageHeader`, per-page components, pure-logic modules with colocated
  `*.test.js`) as `../src`.
- Storage keys are already namespaced (`gym-tracker.*` vs `lifestyle-app.*`),
  so `src/lib/storage.js` can be dropped into the parent app's `localStorage`
  without a collision.
- To merge: copy `src/components`, `src/lib`, and `src/styles.css` (reconciled
  with the parent's CSS variables — both use the same token names, just
  different palettes) into `lifestyle-app/src`, add a `gym` entry to
  `navIcons.js` / `NavBar`, and wire a new case into `App.jsx`'s
  `renderPage()`. No data model changes needed.
- If cross-device sync is ever wanted, follow the parent app's existing
  Supabase pattern (`src/sync.js`, `src/supabase.js`) rather than building a
  separate backend for this app.
