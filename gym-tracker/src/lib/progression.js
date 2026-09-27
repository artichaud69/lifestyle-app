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
import { workingSets } from './workout.js'

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
}

// Weights are compared in hundredths to keep 2.5 + 2.5 + 2.5 out of trouble.
const cents = (weight) => Math.round((Number(weight) || 0) * 100)

function roundToStep(value, step) {
  return Math.round(value / step) * step
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
  return { load: null, reps: [], attemptedLoad: null, noProgressStreak: 0 }
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
  if (working.length === 0) return { load: null, reps: [], attemptedLoad: null, complete: false }

  // Tracked separately from `load` so a track whose sets have never reached
  // the rep floor still knows what weight was on the bar.
  const attemptedLoad = Math.max(...working.map((set) => set.weight))

  const successful = working.filter((set) => set.reps >= repsMin)
  if (successful.length === 0) return { load: null, reps: [], attemptedLoad, complete }

  const load = Math.max(...successful.map((set) => set.weight))
  const reps = successful
    .filter((set) => cents(set.weight) >= cents(load))
    .map((set) => Math.min(set.reps, repsMax))

  return { load, reps: fitVector(reps, targetSets), attemptedLoad, complete }
}

function levelCompleted(reps, config) {
  const slots = fitVector(reps, config.targetSets)
  return slots.length > 0 && slots.every((value) => value >= config.repsMax)
}

// Folds one session into the track state and says what it was worth.
export function applySession(state, achievement, config) {
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
export function trackState(history, config) {
  let state = emptyState()
  let last = null
  for (const { entry } of history) {
    last = applySession(state, sessionAchievement(entry.sets, config), config)
    state = last.state
  }
  return {
    ...state,
    lastOutcome: last?.outcome ?? null,
    deloadedFrom: last?.deloadedFrom ?? null,
  }
}

// The next session's prescription: a load and one rep target per set.
// Returns null when the track has no history to build on at all.
export function nextPrescription(state, config) {
  const { targetSets: slots, repsMin, repsMax, increment, step } = config
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
