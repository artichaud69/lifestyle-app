// The whole "AI" in this app: a deterministic, rule-based coach. No network
// calls, no API key, no account. It applies the same progressive-overload
// and autoregulation logic a good coach would — double progression for
// hypertrophy/general work, linear load progression with deload detection
// for strength compounds — entirely from data already sitting in localStorage.
import { genId } from './id.js'
import { findExercise } from './exercises.js'
import { estimateOneRepMax, workingSets, bestSet, totalVolume, averageRPE, findEntryHistory } from './workout.js'

const GOAL_LABELS = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  general: 'General Fitness',
}

function mkPlanExercise(exerciseId, { sets, repsMin, repsMax, rpe, progression }) {
  return {
    id: genId(),
    exerciseId,
    targetSets: sets,
    repsMin,
    repsMax,
    targetRPE: rpe,
    targetWeight: null,
    progression,
    restSeconds: progression === 'linear' ? 150 : 75,
    supersetGroup: null,
  }
}

function setCount(base, experience) {
  if (experience === 'beginner') return Math.max(2, base - 1)
  if (experience === 'advanced') return base + 1
  return base
}

function buildExercisePlan(exerciseId, goal, experience, { compound }) {
  if (goal === 'strength' && compound) {
    return mkPlanExercise(exerciseId, { sets: setCount(4, experience), repsMin: 5, repsMax: 5, rpe: 8, progression: 'linear' })
  }
  if (goal === 'strength') {
    return mkPlanExercise(exerciseId, { sets: setCount(3, experience), repsMin: 8, repsMax: 12, rpe: 8, progression: 'double' })
  }
  if (goal === 'hypertrophy') {
    return compound
      ? mkPlanExercise(exerciseId, { sets: setCount(4, experience), repsMin: 6, repsMax: 10, rpe: 8, progression: 'double' })
      : mkPlanExercise(exerciseId, { sets: setCount(3, experience), repsMin: 10, repsMax: 15, rpe: 8, progression: 'double' })
  }
  // general fitness
  return mkPlanExercise(exerciseId, { sets: setCount(3, experience), repsMin: 10, repsMax: 15, rpe: 7, progression: 'double' })
}

function session(name, exerciseIds, goal, experience, finisherNote) {
  return {
    id: genId(),
    name,
    finisherNote: finisherNote ?? null,
    exercises: exerciseIds.map((exerciseId) => {
      const exercise = findExercise(exerciseId)
      return buildExercisePlan(exerciseId, goal, experience, { compound: exercise?.compound ?? false })
    }),
  }
}

const FULL_BODY_A = ['back-squat', 'barbell-bench-press', 'barbell-row', 'plank']
const FULL_BODY_B = ['romanian-deadlift', 'overhead-press', 'lat-pulldown', 'cable-crunch']

const UPPER_A = ['barbell-bench-press', 'barbell-row', 'dumbbell-shoulder-press', 'lat-pulldown', 'barbell-curl', 'triceps-pushdown']
const LOWER_A = ['back-squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'calf-raise']
const UPPER_B = ['incline-dumbbell-press', 'one-arm-dumbbell-row', 'lateral-raise', 'chin-up', 'hammer-curl', 'skull-crusher']
const LOWER_B = ['deadlift', 'front-squat', 'bulgarian-split-squat', 'leg-extension', 'calf-raise']

const PUSH = ['barbell-bench-press', 'overhead-press', 'incline-dumbbell-press', 'lateral-raise', 'triceps-pushdown']
const PULL = ['deadlift', 'barbell-row', 'lat-pulldown', 'face-pull', 'barbell-curl']
const LEGS = ['back-squat', 'romanian-deadlift', 'leg-press', 'leg-curl', 'calf-raise']

function splitFor(daysPerWeek) {
  if (daysPerWeek <= 3) return 'full-body'
  if (daysPerWeek === 4) return 'upper-lower'
  return 'push-pull-legs'
}

export function generateProgram({ goal, experience, daysPerWeek, unit }) {
  const split = splitFor(daysPerWeek)
  const cardioNote = goal === 'general' ? '15-20 min easy cardio to finish' : null

  let sessions
  let splitLabel
  if (split === 'full-body') {
    sessions = [
      session('Full Body A', FULL_BODY_A, goal, experience, cardioNote),
      session('Full Body B', FULL_BODY_B, goal, experience, cardioNote),
    ]
    splitLabel = 'Full Body'
  } else if (split === 'upper-lower') {
    sessions = [
      session('Upper A', UPPER_A, goal, experience),
      session('Lower A', LOWER_A, goal, experience),
      session('Upper B', UPPER_B, goal, experience),
      session('Lower B', LOWER_B, goal, experience),
    ]
    splitLabel = 'Upper / Lower'
  } else {
    sessions = [
      session('Push', PUSH, goal, experience),
      session('Pull', PULL, goal, experience),
      session('Legs', LEGS, goal, experience, cardioNote),
    ]
    splitLabel = 'Push / Pull / Legs'
  }

  return {
    id: genId(),
    name: `${GOAL_LABELS[goal]} — ${splitLabel}`,
    goal,
    experience,
    daysPerWeek,
    unit: unit ?? 'kg',
    createdAt: new Date().toISOString(),
    sessions,
  }
}

export function nextSessionTemplate(program, logs) {
  if (!program || program.sessions.length === 0) return null
  const programLogs = logs
    .filter((log) => log.programId === program.id && log.sessionTemplateId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  if (programLogs.length === 0) return program.sessions[0]
  const lastIndex = program.sessions.findIndex((s) => s.id === programLogs[0].sessionTemplateId)
  if (lastIndex === -1) return program.sessions[0]
  return program.sessions[(lastIndex + 1) % program.sessions.length]
}

function roundToStep(value, step) {
  return Math.round(value / step) * step
}

function isSuccessful(planExercise, sets) {
  const working = workingSets(sets)
  if (working.length < planExercise.targetSets) return false
  const target = planExercise.progression === 'linear' ? planExercise.repsMin : planExercise.repsMax
  return working.every((set) => set.reps >= target)
}

function metFloor(planExercise, sets) {
  const working = workingSets(sets)
  if (working.length < planExercise.targetSets) return false
  return working.every((set) => set.reps >= planExercise.repsMin)
}

// Walks backwards through history to count how many sessions in a row have
// failed at the *current* working weight, so a genuine plateau (not just an
// off day) is what triggers a deload suggestion.
function failStreakAtWeight(history, planExercise, weight) {
  let streak = 0
  for (let i = history.length - 1; i >= 0; i--) {
    const { entry } = history[i]
    const working = workingSets(entry.sets)
    if (working.length === 0) break
    const sampleWeight = working[0].weight
    if (Math.round(sampleWeight * 100) !== Math.round(weight * 100)) break
    if (isSuccessful(planExercise, entry.sets)) break
    streak++
  }
  return streak
}

// Suggests the next weight/rep target for one planned exercise, given all
// prior logs for that exercise. Returns the same shape as a session-template
// exercise, plus a one-line `rationale` explaining the call.
export function suggestNextTarget(planExercise, logs, unit = 'kg') {
  // Rounding granularity for cleaning up arithmetic (e.g. floating point
  // noise, a 10% deload), not the jump size itself — that's `increment`,
  // which already matches how the exercise is normally loaded.
  const step = unit === 'kg' ? 0.5 : 1
  const history = findEntryHistory(logs, planExercise.exerciseId, 6)
  const exercise = findExercise(planExercise.exerciseId)
  const increment = exercise?.increment ?? (unit === 'kg' ? 2.5 : 5)

  if (history.length === 0) {
    return {
      ...planExercise,
      rationale: 'First time logging this one — pick a weight that leaves 2-3 reps in reserve on your last set.',
    }
  }

  const last = history[history.length - 1]
  const lastWorking = workingSets(last.entry.sets)
  const lastWeight = lastWorking[0]?.weight ?? planExercise.targetWeight ?? 0
  const rpe = averageRPE(last.entry.sets)
  const success = isSuccessful(planExercise, last.entry.sets)
  const metMinimum = metFloor(planExercise, last.entry.sets)

  if (planExercise.progression === 'linear') {
    if (success) {
      let bump = increment
      if (rpe !== null && rpe <= 6) bump = increment * 2
      if (rpe !== null && rpe >= 9.5) bump = 0
      const newWeight = roundToStep(lastWeight + bump, step)
      const rationale = bump === 0
        ? `Hit every rep last time but it was near-maximal (RPE ${rpe.toFixed(1)}) — repeat ${lastWeight}${unit} and let it feel easier.`
        : `Hit all sets of ${planExercise.repsMin} last time — add ${bump}${unit}.`
      return { ...planExercise, targetWeight: newWeight, rationale }
    }
    const streak = failStreakAtWeight(history, planExercise, lastWeight)
    if (streak >= 3) {
      const deload = roundToStep(lastWeight * 0.9, step)
      return {
        ...planExercise,
        targetWeight: deload,
        rationale: `Stalled at ${lastWeight}${unit} for 3 sessions in a row — deload to ${deload}${unit} and build back up.`,
      }
    }
    return {
      ...planExercise,
      targetWeight: lastWeight,
      rationale: `Missed a rep last time — repeat ${lastWeight}${unit} and aim to hit them all.`,
    }
  }

  // double progression
  if (success) {
    const newWeight = roundToStep(lastWeight + increment, step)
    return {
      ...planExercise,
      targetWeight: newWeight,
      rationale: `Hit the top of your rep range (${planExercise.repsMax}) on every set — up to ${newWeight}${unit}, back to ${planExercise.repsMin} reps.`,
    }
  }
  if (metMinimum) {
    return {
      ...planExercise,
      targetWeight: lastWeight,
      rationale: `In range but not maxed out yet — stay at ${lastWeight}${unit} and add a rep or two per set.`,
    }
  }
  const streak = failStreakAtWeight(history, planExercise, lastWeight)
  if (streak >= 3) {
    const deload = roundToStep(lastWeight * 0.9, step)
    return {
      ...planExercise,
      targetWeight: deload,
      rationale: `Missed the rep range 3 sessions running at ${lastWeight}${unit} — drop to ${deload}${unit}.`,
    }
  }
  return {
    ...planExercise,
    targetWeight: lastWeight,
    rationale: `Missed the rep range last time — repeat ${lastWeight}${unit} before adding weight.`,
  }
}

export function suggestSessionTargets(sessionTemplate, logs, unit = 'kg') {
  return {
    ...sessionTemplate,
    exercises: sessionTemplate.exercises.map((planExercise) => suggestNextTarget(planExercise, logs, unit)),
  }
}

function allTimeBestOneRM(history) {
  let best = 0
  for (const { entry } of history) {
    const set = bestSet(entry.sets)
    if (set) best = Math.max(best, estimateOneRepMax(set.weight, set.reps))
  }
  return best
}

// Produces the post-workout feedback cards: PRs, volume trend, missed
// targets, and plateau alerts. Pure function of the logs already saved.
export function analyzeWorkout(log, allLogs, planExercisesByExerciseId = {}) {
  const priorLogs = allLogs.filter((l) => l.id !== log.id)
  const cards = []
  let prCount = 0

  for (const entry of log.entries) {
    const working = workingSets(entry.sets)
    if (working.length === 0) continue

    const history = findEntryHistory(priorLogs, entry.exerciseId, 6)
    const currentBestSet = bestSet(entry.sets)
    const currentBest1RM = currentBestSet ? estimateOneRepMax(currentBestSet.weight, currentBestSet.reps) : 0
    const priorBest1RM = allTimeBestOneRM(history)

    if (history.length > 0 && currentBest1RM > priorBest1RM * 1.001) {
      cards.push({
        type: 'pr',
        exerciseId: entry.exerciseId,
        exerciseName: entry.exerciseName,
        message: `New best on ${entry.exerciseName}: ${currentBestSet.weight}×${currentBestSet.reps} (est. 1RM ${Math.round(currentBest1RM)}).`,
      })
      prCount++
    }

    const planExercise = planExercisesByExerciseId[entry.exerciseId]
    if (planExercise) {
      const success = isSuccessful(planExercise, entry.sets)
      const metMinimum = metFloor(planExercise, entry.sets)
      if (!metMinimum) {
        cards.push({
          type: 'warning',
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          message: `Missed the target on ${entry.exerciseName} — that happens, the coach will hold the weight next time.`,
        })
      } else if (success && history.length >= 3) {
        const recentBests = [...history.slice(-3).map(({ entry: e }) => {
          const s = bestSet(e.sets)
          return s ? estimateOneRepMax(s.weight, s.reps) : 0
        }), currentBest1RM]
        const flat = Math.max(...recentBests) - Math.min(...recentBests) <= Math.max(...recentBests) * 0.02
        if (flat && currentBest1RM <= priorBest1RM * 1.001) {
          cards.push({
            type: 'stall',
            exerciseId: entry.exerciseId,
            exerciseName: entry.exerciseName,
            message: `${entry.exerciseName} has been flat for a few sessions — consider a deload or swapping in a variation.`,
          })
        }
      }
    }

    if (history.length > 0) {
      const previousEntry = history[history.length - 1].entry
      const prevVolume = totalVolume(previousEntry.sets)
      const currentVolume = totalVolume(entry.sets)
      if (prevVolume > 0 && currentVolume > prevVolume * 1.02) {
        cards.push({
          type: 'progress',
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          message: `Volume on ${entry.exerciseName} is up from last time (${Math.round(prevVolume)} → ${Math.round(currentVolume)}).`,
        })
      }
    }
  }

  const priority = { pr: 0, stall: 1, warning: 2, progress: 3, info: 4 }
  cards.sort((a, b) => priority[a.type] - priority[b.type])

  let overallMessage
  if (prCount > 0) {
    overallMessage = prCount === 1 ? 'New personal best this session.' : `${prCount} personal bests this session.`
  } else if (cards.some((c) => c.type === 'stall')) {
    overallMessage = 'Solid session — a couple of lifts are plateauing, see below.'
  } else {
    overallMessage = 'Session logged — keep it up.'
  }

  return { cards, overallMessage, prCount }
}
