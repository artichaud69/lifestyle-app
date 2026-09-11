// The same lift can be programmed for completely different purposes: heavy
// fives for strength on one day, sets of 10-15 for hypertrophy on another.
// Those working weights are not interchangeable, so "what did I lift last
// time" is not one number per exercise — it is one number per rep scheme.
// This module decides when two prescriptions count as the same kind of work,
// so the coach can progress each one off its own history instead of asking
// for hypertrophy sets at a strength weight.
import { topWorkingSets } from './workout.js'

// How far apart two rep ranges may sit and still count as the same kind of
// work, measured as the gap between the ranges in reps. One rep of slack
// keeps neighbouring prescriptions together (5×5 and 6-8 are the same
// intent) while keeping fives and tens apart, which is the case that
// actually goes wrong.
const EXPLICIT_TOLERANCE = 1
// Schemes inferred from logged reps (older logs, freeform work) get more
// slack: a session where the reps were missed reads lighter than it was
// programmed, and shouldn't be mistaken for a different training intent.
const INFERRED_TOLERANCE = 2

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

// Reps between two ranges; 0 when they overlap.
export function schemeGap(a, b) {
  if (a.repsMax < b.repsMin) return b.repsMin - a.repsMax
  if (b.repsMax < a.repsMin) return a.repsMin - b.repsMax
  return 0
}

// Whether two rep schemes are close enough that a working weight logged
// under one is a sensible starting point for the other. An unknown scheme
// aligns with everything — with nothing to tell them apart, throwing the
// history away would be worse than using it.
export function schemesAlign(a, b) {
  if (!a || !b) return true
  const tolerance = a.inferred || b.inferred ? INFERRED_TOLERANCE : EXPLICIT_TOLERANCE
  return schemeGap(a, b) <= tolerance
}

export function describeScheme(scheme) {
  if (!scheme) return 'these'
  return scheme.repsMin === scheme.repsMax ? `${scheme.repsMin}` : `${scheme.repsMin}-${scheme.repsMax}`
}
