import { formatDate } from './dates.js'
import { bodyweightLoad } from './exercises.js'
import { bodyweightOn } from './bodyweight.js'

// Epley formula: a widely used estimate for how much you could lift for one
// rep, based on a set done for more than one. Good enough to trend progress;
// not meant to be a literal max-attempt prediction.
export function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

// What an e1RM for one exercise on one date needs to know: whether the lift
// moves the body (see bodyweightLoad in exercises.js), and if so, the
// bodyweight on record for that date. Conventional lifts need neither.
export function oneRepMaxContext(exerciseName, date, bodyweightLogs) {
  const load = bodyweightLoad(exerciseName)
  return { bodyweightLoad: load, bodyweight: load ? bodyweightOn(bodyweightLogs, date) : null }
}

// The e1RM of one set.
//
// Conventional lifts: Epley on the weight logged, exactly as before.
//
// Lifts that move the body: the body is part of what's lifted, so Epley runs
// on the total load (bodyweight plus what's added, or minus the assistance),
// then bodyweight is taken back off. The result is the most that could be
// *added* for a single — +15kg × 11 at 87kg bodyweight is 139.4kg total, so
// +52.4kg — and it comes out negative when a single would still need
// assistance, which keeps assisted and unassisted work on one scale.
//
// Null when it can't be known: a bodyweight lift with no bodyweight on
// record, or assistance that takes the whole body's weight.
export function setOneRepMax(set, { bodyweightLoad: load = null, bodyweight = null } = {}) {
  const weight = Number(set?.weight) || 0
  const reps = Number(set?.reps) || 0
  if (!load) return estimateOneRepMax(weight, reps)
  if (!(bodyweight > 0) || !(reps > 0)) return null
  const total = load === 'assisted' ? bodyweight - weight : bodyweight + weight
  if (!(total > 0)) return null
  return estimateOneRepMax(total, reps) - bodyweight
}

// Inverse of the Epley estimate above: the weight you would expect to move
// for `reps` reps, given an estimated one-rep max. Lets a working weight be
// carried across rep ranges — a 5-rep strength load is not a 12-rep
// hypertrophy load, but both can be read off the same 1RM estimate.
export function estimateWeightForReps(oneRepMax, reps) {
  if (!oneRepMax || !reps) return 0
  if (reps === 1) return oneRepMax
  return oneRepMax / (1 + reps / 30)
}

export function workingSets(sets) {
  return (sets ?? []).filter((set) => set.completed && !set.isWarmup)
}

// Ramping/ascending-set schemes (e.g. "3 heavy sets" where earlier sets are
// lighter warm-ups-that-count-as-working-sets) log several weights inside
// one entry. Success/failure should be judged on the sets actually taken at
// the heaviest weight worked that session, not on every working set — a
// lighter ramp-up set landing below the rep target shouldn't count as a
// miss, and it also shouldn't be treated as "the" weight for next time. For
// ordinary straight sets (all working sets share one weight) this returns
// the same array workingSets() would.
export function topWorkingSets(sets) {
  const working = workingSets(sets)
  if (working.length === 0) return working
  const maxWeight = Math.max(...working.map((set) => set.weight))
  return working.filter((set) => Math.round(set.weight * 100) === Math.round(maxWeight * 100))
}

// The working set with the highest e1RM. `context` comes from
// oneRepMaxContext(): ranking a bodyweight lift's sets needs the bodyweight
// too, since 12 bodyweight reps can outrank +10kg × 5. Without it this is the
// conventional ranking, unchanged. Sets whose e1RM can't be known are
// skipped, so this is null when none can.
export function bestSet(sets, context) {
  let best = null
  let bestEst = -Infinity
  for (const set of workingSets(sets)) {
    const est = setOneRepMax(set, context)
    if (est !== null && est > bestEst) {
      best = set
      bestEst = est
    }
  }
  return best
}

export function totalVolume(sets) {
  return workingSets(sets).reduce((sum, set) => sum + set.weight * set.reps, 0)
}

export function averageRPE(sets) {
  const working = workingSets(sets).filter((set) => typeof set.rpe === 'number')
  if (working.length === 0) return null
  return working.reduce((sum, set) => sum + set.rpe, 0) / working.length
}

// Finds, for a given exercise, the most recent logged entry across all past
// workouts — the app's source of "what happened last time". Pass `filter` to
// restrict it to entries worth comparing against (see findEntryHistory).
export function findLastEntry(logs, exerciseId, filter = null) {
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const log of sorted) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId)
    if (entry && workingSets(entry.sets).length > 0 && (!filter || filter(entry))) return { log, entry }
  }
  return null
}

export function formatSetsSummary(sets, unit = 'kg') {
  const working = workingSets(sets)
  if (working.length === 0) return ''
  return working.map((set) => `${set.weight}${unit}×${set.reps}`).join(', ')
}

// Plain-text summary of one workout, meant to be pasted straight into a
// chatbot for feedback — readable prose, not a data dump. Includes every
// completed set (warm-ups labeled separately), a best-set/est. 1RM line per
// exercise, and session totals.
export function formatWorkoutAsText(log, unit = 'kg', bodyweightLogs = []) {
  const lines = [log.sessionName, formatDate(log.date)]

  if (log.startedAt && log.finishedAt) {
    const minutes = Math.round((new Date(log.finishedAt) - new Date(log.startedAt)) / 60000)
    if (minutes > 0) lines.push(`Duration: ${minutes} min`)
  }
  lines.push('')

  for (const entry of log.entries) {
    const completed = entry.sets.filter((set) => set.completed)
    if (completed.length === 0) continue

    lines.push(entry.exerciseName)
    let workingIndex = 0
    for (const set of completed) {
      const label = set.isWarmup ? '  Warm-up' : `  Set ${++workingIndex}`
      const rpe = typeof set.rpe === 'number' ? ` @ RPE ${set.rpe}` : ''
      lines.push(`${label}: ${set.weight}${unit} × ${set.reps}${rpe}`)
    }
    const context = oneRepMaxContext(entry.exerciseName, log.date, bodyweightLogs)
    const best = bestSet(entry.sets, context)
    if (best && context.bodyweightLoad) {
      const added = Math.round(setOneRepMax(best, context))
      lines.push(
        `  Best set est. 1RM: ${added >= 0 ? '+' : ''}${added}${unit} added (at ${context.bodyweight}${unit} bodyweight)`,
      )
    } else if (best) {
      lines.push(`  Best set est. 1RM: ${Math.round(estimateOneRepMax(best.weight, best.reps))}${unit}`)
    }
    lines.push('')
  }

  const volume = log.entries.reduce((sum, entry) => sum + totalVolume(entry.sets), 0)
  lines.push(`Total volume: ${Math.round(volume)}${unit}`)

  if (log.notes) {
    lines.push('')
    lines.push(`Notes: ${log.notes}`)
  }

  return lines.join('\n')
}

// Defensive merge for a finished workout's entries: if the same exercise
// somehow ended up added twice (e.g. picked again mid-workout), combine
// their sets into one entry instead of saving two split cards to history —
// the coach and reports only ever look at the first entry matching an
// exerciseId, so a split would silently drop the second entry's sets.
export function mergeEntriesByExercise(entries) {
  const order = []
  const byExerciseId = new Map()
  for (const entry of entries) {
    const existing = byExerciseId.get(entry.exerciseId)
    if (existing) {
      existing.sets = [...existing.sets, ...entry.sets]
    } else {
      const copy = { ...entry, sets: [...entry.sets] }
      byExerciseId.set(entry.exerciseId, copy)
      order.push(entry.exerciseId)
    }
  }
  return order.map((exerciseId) => byExerciseId.get(exerciseId))
}

// `filter` narrows which past entries count — the coach uses it to keep a
// lift's strength history and its hypertrophy history apart. It is applied
// before `limit`, so filtering never costs you matching sessions.
export function findEntryHistory(logs, exerciseId, limit = 10, filter = null) {
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  const history = []
  for (const log of sorted) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId)
    if (entry && workingSets(entry.sets).length > 0 && (!filter || filter(entry))) {
      history.push({ date: log.date, entry })
      if (history.length >= limit) break
    }
  }
  return history.reverse()
}
