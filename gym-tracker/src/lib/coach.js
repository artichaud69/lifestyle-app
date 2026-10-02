// The whole "AI" in this app: a deterministic, rule-based coach. No network
// calls, no API key, no account. It applies the same progressive-overload
// and autoregulation logic a good coach would — double progression for
// hypertrophy/general work, linear load progression with deload detection
// for strength compounds — entirely from data already sitting in localStorage.
//
// Progression is tracked per exercise AND per prescribed rep range: the same
// lift trained as heavy fives one day and sets of 10-15 another has two
// separate tracks that never touch. trainingIntent.js decides which past
// sessions belong to a track; progression.js folds a track's history into a
// state and prescribes the next step. This file wires those to the program and
// the post-workout report.
import { genId } from './id.js'
import { findExercise } from './exercises.js'
import {
  estimateOneRepMax,
  estimateWeightForReps,
  workingSets,
  bestSet,
  totalVolume,
  findEntryHistory,
} from './workout.js'
import { planScheme, entryScheme, sameTrack, describeScheme } from './trainingIntent.js'
import { trainingDays, longestGapBetween, dayNumber } from './breaks.js'
import { todayISO } from './dates.js'
import {
  OUTCOME,
  NO_PROGRESS_LIMIT,
  sessionAchievement,
  applySession,
  trackState,
  nextPrescription,
  formatRepsPerSet,
} from './progression.js'

// When a lift has no history at the rep range being planned — the first
// hypertrophy session for something previously trained as heavy fives, say —
// the working weight is converted through the shared 1RM estimate rather
// than copied across. That estimate describes a single all-out rep, so hold
// a little back before asking for several sets at the converted load.
const CROSS_SCHEME_RESERVE = 0.9

// How far back the progression fold reads. The state is a running maximum of
// what's been demonstrated, so a longer window is strictly better information;
// this only bounds the work per render.
const TRACK_HISTORY_LIMIT = 20

const GOAL_LABELS = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  general: 'General Fitness',
}

// `progression` no longer selects a progression rule — the rep ladder covers
// both, since a range whose min equals its max (5×5) has a single rung and so
// advances the load every time it is completed. It survives as the label for
// how a plan was built, and it still picks the default rest time.
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
    longOnly: false,
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

function floorToStep(value, step) {
  return Math.floor(value / step + 1e-9) * step
}

// Last resort when a lift is planned at a rep range it has no history at:
// read the most recent session of any rep range, turn its best set into a
// 1RM estimate, and solve that back down to the reps now being asked for.
// Returns null when there is nothing to convert from (no history at all, or
// unweighted work like bodyweight sets), leaving the first-time advice.
function crossSchemeTarget(planExercise, logs, { increment, step, unit }) {
  const recent = findEntryHistory(logs, planExercise.exerciseId, 1)
  if (recent.length === 0) return null

  const entry = recent[0].entry
  const reference = bestSet(entry.sets)
  if (!reference || !(reference.weight > 0) || !(reference.reps > 0)) return null

  const targetReps = planExercise.repsMin
  if (!(targetReps > 0)) return null

  const oneRepMax = estimateOneRepMax(reference.weight, reference.reps)
  const converted = estimateWeightForReps(oneRepMax, targetReps) * CROSS_SCHEME_RESERVE
  // Round down onto the exercise's own loading grid: the first session at a
  // new rep range should err light, and it's the reps that are the target.
  const targetWeight = roundToStep(Math.max(floorToStep(converted, increment), increment), step)

  return {
    ...planExercise,
    targetWeight,
    targetReps,
    targetRepsPerSet: Array.from({ length: Math.max(1, Number(planExercise.targetSets) || 1) }, () => targetReps),
    rationale: `No history yet at ${describeScheme(planScheme(planExercise))} reps — your last session was ${reference.weight}${unit}×${reference.reps}, which works out to about ${targetWeight}${unit} for sets of ${targetReps}. Adjust on the first set if it reads wrong.`,
  }
}

// The loading grid and rep range one planned exercise progresses on. `step`
// only cleans up arithmetic (floating-point noise, a 10% deload); `increment`
// is the jump size, and already matches how the exercise is normally loaded.
export function trackConfig(planExercise, unit = 'kg') {
  const exercise = findExercise(planExercise.exerciseId)
  const repsMin = Math.max(1, Number(planExercise.repsMin) || 1)
  const repsMax = Math.max(repsMin, Number(planExercise.repsMax) || repsMin)
  return {
    targetSets: Math.max(1, Number(planExercise.targetSets) || 1),
    repsMin,
    repsMax,
    increment: exercise?.increment ?? (unit === 'kg' ? 2.5 : 5),
    step: unit === 'kg' ? 0.5 : 1,
  }
}

// The past sessions belonging to this prescription's track, oldest first.
export function trackHistory(planExercise, logs) {
  const scheme = planScheme(planExercise)
  return findEntryHistory(logs, planExercise.exerciseId, TRACK_HISTORY_LIMIT, (entry) =>
    sameTrack(entryScheme(entry), scheme),
  )
}

// Marks each session in a track's history with the longest stretch of no
// training at all since the track's previous session, and measures the same
// for the stretch from its last session up to `untilIso`. Breaks are read
// across every workout logged, not just this track's.
export function withBreaks(history, logs, untilIso) {
  const days = trainingDays(logs)
  const annotated = history.map((item, i) => ({
    ...item,
    breakDays: i === 0 ? 0 : longestGapBetween(days, dayNumber(history[i - 1].date), dayNumber(item.date)),
  }))
  const last = history[history.length - 1]
  const pendingBreakDays = last ? longestGapBetween(days, dayNumber(last.date), dayNumber(untilIso)) : 0
  return { history: annotated, pendingBreakDays }
}

function rationaleFor(next, state, config, unit) {
  const target = formatRepsPerSet(next.repsPerSet)
  const range = `${config.repsMin}-${config.repsMax}`

  if (next.rebuilding) {
    const { step, of, fromLoad, breakDays } = next.rebuilding
    return `Back from a ${breakDays}-day break — easing in at ${next.load}${unit} (${step} of ${of}) on your way back to ${fromLoad}${unit}. If it moves easily, go heavier: the coach follows what you lift.`
  }
  if (state.deloadedFrom) {
    return `${NO_PROGRESS_LIMIT} sessions without progress at ${state.deloadedFrom}${unit} — drop to ${next.load}${unit} and build back up to ${target}.`
  }
  if (next.needsProgressionOverload) {
    return `Every set at ${config.repsMax} reps — this one has no weight to add, so make it harder (slower, harder variation) or add reps beyond the range.`
  }
  if (next.levelCompleted) {
    return `Every set at ${config.repsMax} reps at ${next.previousLoad}${unit} — up to ${next.load}${unit}, back to ${config.repsMin}s.`
  }
  if (next.consolidating) {
    return `Build up to ${target} at ${next.load}${unit} before adding weight.`
  }
  const streak = state.noProgressStreak
  const streakNote =
    streak > 0
      ? ` ${streak} session${streak === 1 ? '' : 's'} without new ground — ${NO_PROGRESS_LIMIT - streak} more and the coach will unload.`
      : ''
  return `You've shown ${formatRepsPerSet(next.demonstrated)} at ${next.load}${unit} — next step is ${target}. One set at a time, anywhere in ${range}.${streakNote}`
}

// Suggests the next weight/rep target for one planned exercise, given all
// prior logs for that exercise. Returns the same shape as a session-template
// exercise, plus a one-line `rationale` explaining the call.
export function suggestNextTarget(planExercise, logs, unit = 'kg', today = todayISO()) {
  const config = trackConfig(planExercise, unit)
  const { increment, step } = config
  const { history, pendingBreakDays } = withBreaks(trackHistory(planExercise, logs), logs, today)

  const withoutHistory = () =>
    crossSchemeTarget(planExercise, logs, { increment, step, unit }) ?? {
      ...planExercise,
      targetRepsPerSet: null,
      rationale: 'First time logging this one — pick a weight that leaves 2-3 reps in reserve on your last set.',
    }

  if (history.length === 0) return withoutHistory()

  const state = trackState(history, config, { pendingBreakDays })
  const next = nextPrescription(state, config)
  // Aligned history exists but nothing usable in it (every set unweighted and
  // short of the floor) — fall back to the cross-range estimate.
  if (!next) return withoutHistory()

  return {
    ...planExercise,
    targetWeight: next.load,
    // Per-set targets: the ladder is climbed one set at a time, so the sets
    // are not all asking for the same number of reps.
    targetRepsPerSet: next.repsPerSet,
    // Kept for callers that only understand a single number (the heaviest set).
    targetReps: next.repsPerSet[0],
    rationale: rationaleFor(next, state, config, unit),
  }
}

export function suggestSessionTargets(sessionTemplate, logs, unit = 'kg', today = todayISO()) {
  return {
    ...sessionTemplate,
    exercises: sessionTemplate.exercises.map((planExercise) => suggestNextTarget(planExercise, logs, unit, today)),
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
export function analyzeWorkout(log, allLogs, planExercisesByExerciseId = {}, unit = 'kg') {
  const priorLogs = allLogs.filter((l) => l.id !== log.id)
  const cards = []
  let prCount = 0
  let levelCount = 0
  let rebuildCount = 0

  for (const entry of log.entries) {
    const working = workingSets(entry.sets)
    if (working.length === 0) continue

    // Personal bests are measured off the 1RM estimate, which is comparable
    // across rep ranges, so they read all of the exercise's history.
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

    // What this session was worth on its own progression track: replay the
    // track's prior sessions, then fold this one in and report the outcome.
    // Nothing here grades the workout against the prescription.
    const planExercise = planExercisesByExerciseId[entry.exerciseId]
    let outcome = null
    if (planExercise) {
      const config = trackConfig(planExercise, unit)
      // Breaks are measured up to this session's date, so the first session
      // back is judged as a rebuild, not against pre-holiday form.
      const { history: prior, pendingBreakDays } = withBreaks(trackHistory(planExercise, priorLogs), allLogs, log.date)
      const before = trackState(prior, config, { pendingBreakDays })
      const result = applySession(before, sessionAchievement(entry.sets, config), config)
      outcome = result.outcome

      if (outcome === OUTCOME.rebuilding) {
        const nextRebuild = result.state.rebuild
        cards.push({
          type: 'progress',
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          message: result.rebuildEnded
            ? `${entry.exerciseName} is back to its pre-break ${before.rebuild.fromLoad}${unit} — normal progression resumes next session.`
            : `${entry.exerciseName}: ${result.rebuildCleared}${unit} cleared on the way back from your break — ${nextRebuild.loads[nextRebuild.step]}${unit} next.`,
        })
        rebuildCount++
      } else if (outcome === OUTCOME.noProgress && before.rebuild && !result.deloadedFrom) {
        cards.push({
          type: 'info',
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          message: `${entry.exerciseName} isn't back yet — that's normal after a break. Same weight next time.`,
        })
      } else if (outcome === OUTCOME.levelCompleted) {
        cards.push({
          type: 'progress',
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          message: `${entry.exerciseName} is done at this weight — every set at ${config.repsMax} reps. The load goes up next session.`,
        })
        levelCount++
      } else if (outcome === OUTCOME.progress) {
        cards.push({
          type: 'progress',
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          message: result.rebuildEnded
            ? `${entry.exerciseName} is past its pre-break level already: ${formatRepsPerSet(result.state.reps)} at ${result.state.load}${unit}. Normal progression resumes.`
            : `${entry.exerciseName} moved forward: ${formatRepsPerSet(result.state.reps)} at ${result.state.load}${unit} is the best you've shown at this weight.`,
        })
      } else if (outcome === OUTCOME.noProgress) {
        const deloaded = result.deloadedFrom
        cards.push({
          type: deloaded ? 'stall' : 'info',
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          message: deloaded
            ? `${entry.exerciseName} has held at ${deloaded}${unit} for ${NO_PROGRESS_LIMIT} sessions — dropping to ${result.state.load}${unit} next time to build back up.`
            : `No new ground on ${entry.exerciseName} today — the weight and targets stay put next session.`,
        })
      }
      // OUTCOME.incomplete says nothing either way, so it gets no card.
    }

    // Volume trend, for exercises with no track of their own (freeform work)
    // or a session that didn't move the track. With an outcome card already
    // posted, this would just be a second opinion on the same session.
    if (!outcome || outcome === OUTCOME.incomplete) {
      const scheme = entryScheme(entry)
      const schemeHistory = findEntryHistory(priorLogs, entry.exerciseId, 6, (past) =>
        sameTrack(entryScheme(past), scheme),
      )
      if (schemeHistory.length > 0) {
        const previousEntry = schemeHistory[schemeHistory.length - 1].entry
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
  }

  const priority = { pr: 0, stall: 1, warning: 2, progress: 3, info: 4 }
  cards.sort((a, b) => priority[a.type] - priority[b.type])

  let overallMessage
  if (prCount > 0) {
    overallMessage = prCount === 1 ? 'New personal best this session.' : `${prCount} personal bests this session.`
  } else if (levelCount > 0) {
    overallMessage =
      levelCount === 1 ? 'One lift finished its current weight — it goes up next time.' : `${levelCount} lifts finished their current weight.`
  } else if (rebuildCount > 0) {
    overallMessage = 'Good session back — your lifts are on their way to pre-break form.'
  } else if (cards.some((c) => c.type === 'stall')) {
    overallMessage = 'Session logged — a lift is being unloaded, see below.'
  } else if (cards.some((c) => c.type === 'progress')) {
    overallMessage = 'Session logged — you moved forward today.'
  } else {
    overallMessage = 'Session logged — keep it up.'
  }

  return { cards, overallMessage, prCount, levelCount, rebuildCount }
}
