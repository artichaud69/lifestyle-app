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
