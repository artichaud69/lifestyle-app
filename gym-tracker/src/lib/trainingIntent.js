// The same lift can be programmed for completely different purposes: heavy
// fives for strength on one day, sets of 10-15 for hypertrophy on another.
// Those working weights are not interchangeable, so "what did I lift last
// time" is not one number per exercise — it is one progression track per
// prescribed rep range. This module decides which past sessions belong to the
// track being planned, so progression.js can fold each track's own history.
//
// The prescribed range is the track's identity, exactly as written: 5-8 and
// 4-7 are different tracks. Editing a session's rep range therefore starts a
// new track rather than reinterpreting the old one's history.
import { topWorkingSets } from './workout.js'

function makeScheme(repsMin, repsMax, inferred) {
  const min = Number(repsMin)
  const max = Number(repsMax)
  if (!(min > 0) || !(max > 0)) return null
  return { repsMin: Math.min(min, max), repsMax: Math.max(min, max), inferred }
}

// The rep scheme a planned exercise asks for. Null when the plan doesn't
// specify one (freeform work), which means "comparable to anything".
export function planScheme(planExercise) {
  if (!planExercise) return null
  return makeScheme(planExercise.repsMin, planExercise.repsMax, false)
}

// Reads the scheme off the reps actually logged. Only the top working sets
// count, so a lighter ramp-up set doesn't widen the range.
export function inferSchemeFromSets(sets) {
  const reps = topWorkingSets(sets)
    .map((set) => Number(set.reps))
    .filter((value) => value > 0)
  if (reps.length === 0) return null
  return makeScheme(Math.min(...reps), Math.max(...reps), true)
}

// The scheme a past entry was trained under. Logged entries carry the plan's
// rep range in `scheme` (see finishWorkout in App.jsx); entries saved before
// that existed, and freeform ones, fall back to what the reps imply.
export function entryScheme(entry) {
  if (!entry) return null
  const recorded = makeScheme(entry.scheme?.repsMin, entry.scheme?.repsMax, false)
    ?? makeScheme(entry.planExercise?.repsMin, entry.planExercise?.repsMax, false)
  return recorded ?? inferSchemeFromSets(entry.sets)
}

// A session whose range had to be inferred (logged before ranges were
// recorded, or freeform) is judged on its best set. Landing above the
// prescribed ceiling means it was a different, higher-rep prescription;
// landing a little under the floor just means reps were missed, which is
// ordinary inside this track — so the floor gets a couple of reps of slack.
const INFERRED_FLOOR_SLACK = 2

// Whether a past session belongs to the track a prescription describes.
//
// Recorded ranges must match exactly — the prescribed range *is* the track
// identity, so re-prescribing 5-8 as 4-7 starts a new track. Inferred ranges
// can only be tested for plausibility (see above); discarding them instead
// would restart every lift logged before ranges were recorded.
export function sameTrack(scheme, trackScheme) {
  if (!scheme || !trackScheme) return true
  if (scheme.inferred === trackScheme.inferred) {
    return scheme.repsMin === trackScheme.repsMin && scheme.repsMax === trackScheme.repsMax
  }
  const [prescribed, observed] = scheme.inferred ? [trackScheme, scheme] : [scheme, trackScheme]
  return (
    observed.repsMax <= prescribed.repsMax && observed.repsMax >= prescribed.repsMin - INFERRED_FLOOR_SLACK
  )
}

export function describeScheme(scheme) {
  if (!scheme) return 'these'
  return scheme.repsMin === scheme.repsMax ? `${scheme.repsMin}` : `${scheme.repsMin}-${scheme.repsMax}`
}
