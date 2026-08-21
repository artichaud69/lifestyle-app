import { formatDate } from './dates.js'

// Epley formula: a widely used estimate for how much you could lift for one
// rep, based on a set done for more than one. Good enough to trend progress;
// not meant to be a literal max-attempt prediction.
export function estimateOneRepMax(weight, reps) {
  if (!weight || !reps) return 0
  if (reps === 1) return weight
  return weight * (1 + reps / 30)
}

export function workingSets(sets) {
  return (sets ?? []).filter((set) => set.completed && !set.isWarmup)
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
// workouts — the coach's only source of "what happened last time".
export function findLastEntry(logs, exerciseId) {
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const log of sorted) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId)
    if (entry && workingSets(entry.sets).length > 0) return { log, entry }
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

export function findEntryHistory(logs, exerciseId, limit = 10) {
  const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date))
  const history = []
  for (const log of sorted) {
    const entry = log.entries.find((e) => e.exerciseId === exerciseId)
    if (entry && workingSets(entry.sets).length > 0) {
      history.push({ date: log.date, entry })
      if (history.length >= limit) break
    }
  }
  return history.reverse()
}
