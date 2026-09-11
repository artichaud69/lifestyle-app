import { formatDate } from './dates.js'

// Epley formula: a widely used estimate for how much you could lift for one
// rep, based on a set done for more than one. Good enough to trend progress;
// not meant to be a literal max-attempt prediction.
export function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
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

export function bestSet(sets) {
  const working = workingSets(sets)
  if (working.length === 0) return null
  return working.reduce((best, set) => {
    const est = estimateOneRepMax(set.weight, set.reps)
    const bestEst = best ? estimateOneRepMax(best.weight, best.reps) : -1
    return est > bestEst ? set : best
  }, null)
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
export function formatWorkoutAsText(log, unit = 'kg') {
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
    const best = bestSet(entry.sets)
    if (best) {
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
