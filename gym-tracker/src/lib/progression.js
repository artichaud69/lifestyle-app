// The progression engine. One track per (exercise, prescribed rep range) —
// trainingIntent.js draws that line.
//
// THE MODEL: a tally of successful sets. A set is successful when it reaches a
// rep level at no less than the track's working load. A track's state is the
// best rep vector the athlete has demonstrated at that load, sorted
// descending with one slot per working set: slot i holding r reads as "at
// least i+1 sets have been taken to r reps". So [7,6,6] means all three sets
// have been taken to 6 and one of them to 7.
//
// That makes progression gradual and set-level. From [5,5,5] the next step is
// one set at 6, not all three:
//
//   5/5/5 → 6/5/5 → 6/6/5 → 6/6/6 → 7/6/6 → 7/7/6 → 7/7/7 → 8/7/7 → 8/8/8
//
// Progress is any slot moving up, so a 6/5/5 session against a 6/6/6
// prescription is real progress, not a failure. The prescription is only ever
// a recommendation: state is folded out of the sets actually logged, and the
// fold takes the slot-wise maximum, so what the athlete demonstrated always
// wins and a lighter back-off set can never erase a heavier one.
//
// After a training break (breaks.js) a track enters a short REBUILD: the
// pre-break state is kept untouched as the level to return to, and the next
// few sessions are prescribed at reduced loads stepping back up to it. The
// rebuild is judged on its own lighter targets, so the expected dip after a
// holiday never reads as lost progress — and lifting the pre-break weights
// early ends it on the spot.
import { workingSets } from './workout.js'
import { rebuildPlan } from './breaks.js'

// Consecutive no-progress sessions before the existing deload fires.
export const NO_PROGRESS_LIMIT = 3
const DELOAD_FACTOR = 0.9

export const OUTCOME = {
  // At least one slot improved, or a heavier load was established.
  progress: 'progress',
  // Every slot is at the top of the rep range — the load goes up next time.
  levelCompleted: 'level-completed',
  // A complete session that demonstrated nothing new.
  noProgress: 'no-progress',
  // Fewer working sets than prescribed. Missing data is not evidence of
  // regression, so this never counts toward the deload streak.
  incomplete: 'incomplete',
  // A rebuild step cleared after a break — back on the way to pre-break form.
  rebuilding: 'rebuilding',
}

// Weights are compared in hundredths to keep 2.5 + 2.5 + 2.5 out of trouble.
const cents = (weight) => Math.round((Number(weight) || 0) * 100)

function roundToStep(value, step) {
  return Math.round(value / step) * step
}

function floorToStep(value, step) {
  return Math.floor(value / step + 1e-9) * step
}

const sortDesc = (reps) => [...reps].sort((a, b) => b - a)

// Every state/achievement vector is exactly `slots` long, descending, so the
// two can be merged slot by slot. Unreached slots sit at 0.
function fitVector(reps, slots) {
  const padded = sortDesc(reps).slice(0, slots)
  while (padded.length < slots) padded.push(0)
  return padded
}

export function emptyState() {
  return { load: null, reps: [], attemptedLoad: null, noProgressStreak: 0, rebuild: null }
}

// What one logged entry demonstrates, on its own terms.
//
// `load` is the heaviest weight carrying a *successful* set — one that reached
// repsMin. A heavier set short of the floor (105×4 in a 5-8 range) therefore
// does not move the baseline, while 105×5 does. `reps` counts only the sets at
// that load, each capped at repsMax so an overshoot can't push the tally past
// the top of the range.
export function sessionAchievement(sets, config) {
  const { targetSets, repsMin, repsMax } = config
  const working = workingSets(sets).map((set) => ({
    weight: Number(set.weight) || 0,
    reps: Number(set.reps) || 0,
  }))
  const complete = working.length >= targetSets
  if (working.length === 0) return { load: null, reps: [], attemptedLoad: null, complete: false, sets: [] }

  // Tracked separately from `load` so a track whose sets have never reached
  // the rep floor still knows what weight was on the bar.
  const attemptedLoad = Math.max(...working.map((set) => set.weight))

  const successful = working.filter((set) => set.reps >= repsMin)
  if (successful.length === 0) return { load: null, reps: [], attemptedLoad, complete, sets: working }

  const load = Math.max(...successful.map((set) => set.weight))
  const reps = successful
    .filter((set) => cents(set.weight) >= cents(load))
    .map((set) => Math.min(set.reps, repsMax))

  return { load, reps: fitVector(reps, targetSets), attemptedLoad, complete, sets: working }
}

function levelCompleted(reps, config) {
  const slots = fitVector(reps, config.targetSets)
  return slots.length > 0 && slots.every((value) => value >= config.repsMax)
}

// Starts a rebuild after a break of `breakDays`. The demonstrated state is
// left exactly as it was — it is the level being returned to — and the
// rebuild holds the lighter loads that lead back up to it, one per session,
// each asking for the reps already shown before the break.
export function startRebuild(state, breakDays, config) {
  const plan = rebuildPlan(breakDays)
  if (!plan || !(state.load > 0)) return state

  const { targetSets, repsMin, repsMax, increment, step } = config
  const fromLoad = state.load
  const loads = []
  for (let i = 0; i < plan.sessions; i++) {
    const fraction = 1 - plan.reduction * (1 - i / plan.sessions)
    // Rounded down onto the exercise's loading grid, like any first session
    // at an unfamiliar weight: easing back in should err light.
    const load = roundToStep(Math.max(floorToStep(fromLoad * fraction, increment), increment), step)
    if (cents(load) < cents(fromLoad) && cents(load) !== cents(loads[loads.length - 1] ?? -1)) loads.push(load)
  }
  if (loads.length === 0) return state

  const reps = fitVector(state.reps, targetSets).map((value) => Math.min(Math.max(value, repsMin), repsMax))
  return { ...state, noProgressStreak: 0, rebuild: { breakDays, fromLoad, loads, reps, step: 0 } }
}

// The heaviest weight at which a session took every prescribed set to its rep
// target — "at least the requested reps, at no less than the requested
// weight" — or null if no weight did. A set heavier than the threshold counts
// toward it; a lighter one never does.
function clearedLoad(sets, targetReps) {
  const loads = [...new Set(sets.map((set) => cents(set.weight)))].sort((a, b) => b - a)
  for (const threshold of loads) {
    const reps = sortDesc(sets.filter((set) => cents(set.weight) >= threshold).map((set) => set.reps))
    if (targetReps.every((target, i) => (reps[i] ?? 0) >= target)) return threshold / 100
  }
  return null
}

function applyRebuildSession(state, achievement, config) {
  const { rebuild } = state

  // Improving on the pre-break state by the ordinary rules is being back to
  // form, whatever step the rebuild had reached: the rebuild is over.
  const ordinary = applySession({ ...state, rebuild: null }, achievement, config)
  if (ordinary.outcome === OUTCOME.progress || ordinary.outcome === OUTCOME.levelCompleted) {
    return { ...ordinary, rebuildEnded: true }
  }

  const carried = { ...state, attemptedLoad: ordinary.state.attemptedLoad }
  const stepLoad = rebuild.loads[rebuild.step]
  const cleared = clearedLoad(achievement.sets, rebuild.reps)

  if (cleared !== null && cents(cleared) >= cents(stepLoad)) {
    // Skip every step the session already lifted past — actual performance
    // overrides the plan here too. Clearing the pre-break load itself (equal,
    // not better) finishes the rebuild.
    const nextStep = rebuild.loads.findIndex((load) => cents(load) > cents(cleared))
    const done = nextStep === -1
    return {
      state: { ...carried, noProgressStreak: 0, rebuild: done ? null : { ...rebuild, step: nextStep } },
      outcome: OUTCOME.rebuilding,
      rebuildCleared: cleared,
      rebuildEnded: done,
    }
  }

  if (!achievement.complete) return { state: carried, outcome: OUTCOME.incomplete }

  // Missing even the eased-in target is genuine no-progress, and three in a
  // row means more was lost than the break suggested: unload from the rebuild
  // weight, not the pre-break one, and let the ordinary ladder take over.
  const noProgressStreak = carried.noProgressStreak + 1
  if (noProgressStreak >= NO_PROGRESS_LIMIT) {
    return {
      state: {
        ...carried,
        load: roundToStep(stepLoad * DELOAD_FACTOR, config.step),
        reps: [],
        noProgressStreak: 0,
        rebuild: null,
      },
      outcome: OUTCOME.noProgress,
      deloadedFrom: stepLoad,
    }
  }
  return { state: { ...carried, noProgressStreak }, outcome: OUTCOME.noProgress }
}

// Folds one session into the track state and says what it was worth.
export function applySession(state, achievement, config) {
  if (state.rebuild) return applyRebuildSession(state, achievement, config)

  const slots = config.targetSets
  const attemptedLoad =
    achievement.attemptedLoad === null
      ? state.attemptedLoad
      : Math.max(state.attemptedLoad ?? 0, achievement.attemptedLoad)
  const carried = { ...state, attemptedLoad }

  let advanced = null
  if (achievement.load !== null) {
    if (state.load === null || cents(achievement.load) > cents(state.load)) {
      // A heavier load is its own ladder — start its tally from what was just
      // shown at it, not from the reps banked at the lighter load.
      advanced = { ...carried, load: achievement.load, reps: achievement.reps }
    } else if (cents(achievement.load) === cents(state.load)) {
      const before = fitVector(state.reps, slots)
      const merged = before.map((value, i) => Math.max(value, achievement.reps[i] ?? 0))
      if (merged.some((value, i) => value > before[i])) advanced = { ...carried, reps: merged }
    }
    // A load below the established baseline demonstrates nothing new: it is
    // back-off or fatigue work, and it must not lower the state.
  }

  if (advanced) {
    const state_ = { ...advanced, noProgressStreak: 0 }
    return {
      state: state_,
      outcome: levelCompleted(state_.reps, config) ? OUTCOME.levelCompleted : OUTCOME.progress,
    }
  }

  if (!achievement.complete) return { state: carried, outcome: OUTCOME.incomplete }

  const noProgressStreak = carried.noProgressStreak + 1
  if (noProgressStreak >= NO_PROGRESS_LIMIT && carried.load !== null) {
    return {
      state: {
        ...carried,
        load: roundToStep(carried.load * DELOAD_FACTOR, config.step),
        reps: [],
        noProgressStreak: 0,
      },
      outcome: OUTCOME.noProgress,
      deloadedFrom: carried.load,
    }
  }
  return { state: { ...carried, noProgressStreak }, outcome: OUTCOME.noProgress }
}

// Replays a track's sessions oldest-first into a current state. Derived, not
// stored: editing or deleting a past workout simply re-derives, and there is
// nothing to migrate.
//
// History items may carry `breakDays`: the longest stretch without any
// training before that session. `pendingBreakDays` is the same for the
// stretch between the last session and now, so a break that hasn't been
// trained through yet still shapes the next prescription.
export function trackState(history, config, { pendingBreakDays = 0 } = {}) {
  let state = emptyState()
  let last = null
  for (const { entry, breakDays = 0 } of history) {
    state = startRebuild(state, breakDays, config)
    last = applySession(state, sessionAchievement(entry.sets, config), config)
    state = last.state
  }
  const pending = startRebuild(state, pendingBreakDays, config)
  const breakPending = pending !== state
  return {
    ...pending,
    lastOutcome: last?.outcome ?? null,
    // A break after the last session supersedes whatever it concluded.
    deloadedFrom: breakPending ? null : last?.deloadedFrom ?? null,
  }
}

// The next session's prescription: a load and one rep target per set.
// Returns null when the track has no history to build on at all.
export function nextPrescription(state, config) {
  const { targetSets: slots, repsMin, repsMax, increment, step } = config

  if (state.rebuild) {
    const { loads, reps, step: index, fromLoad, breakDays } = state.rebuild
    return {
      load: loads[index],
      repsPerSet: reps,
      levelCompleted: false,
      rebuilding: { step: index + 1, of: loads.length, fromLoad, breakDays },
    }
  }

  const load = state.load ?? state.attemptedLoad
  if (load === null || load === undefined) return null

  const demonstrated = state.load === null ? [] : fitVector(state.reps, slots)
  const filled = Array.from({ length: slots }, (_, i) => Math.min(demonstrated[i] ?? 0, repsMax))

  if (filled.every((value) => value >= repsMax)) {
    // Top of the range on every set. Bodyweight work has no load to add, so
    // hold there and let the caller say it needs a harder variation.
    if (!(load > 0)) {
      return { load, repsPerSet: filled, levelCompleted: true, needsProgressionOverload: true }
    }
    return {
      load: roundToStep(load + increment, step),
      repsPerSet: Array.from({ length: slots }, () => repsMin),
      levelCompleted: true,
      previousLoad: load,
    }
  }

  // Some set has not yet been carried to the bottom of the range at this load
  // (a fresh load, or a session cut short). Consolidate before laddering up.
  if (filled.some((value) => value < repsMin)) {
    return {
      load,
      repsPerSet: sortDesc(filled.map((value) => Math.max(value, repsMin))),
      levelCompleted: false,
      consolidating: true,
    }
  }

  // Ladder: one more rep on the weakest set, which is the last slot.
  const raised = [...filled]
  raised[slots - 1] += 1
  return { load, repsPerSet: sortDesc(raised), levelCompleted: false, demonstrated: filled }
}

export function formatRepsPerSet(repsPerSet) {
  return (repsPerSet ?? []).join('/')
}
