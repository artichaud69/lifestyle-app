import { describe, it, expect } from 'vitest'
import {
  OUTCOME,
  sessionAchievement,
  applySession,
  trackState,
  nextPrescription,
  emptyState,
} from './progression.js'

// 3 working sets in a 5-8 rep range, 2.5kg jumps — the worked example throughout.
const CONFIG = { targetSets: 3, repsMin: 5, repsMax: 8, increment: 2.5, step: 0.5 }

const set = (weight, reps) => ({ weight, reps, completed: true, isWarmup: false })
const at = (weight, ...reps) => reps.map((r) => set(weight, r))
const session = (sets) => ({ entry: { sets } })

// Replays a list of sessions and returns the prescription for the next one.
function prescribe(sessions, config = CONFIG) {
  const state = trackState(sessions.map(session), config)
  return { state, next: nextPrescription(state, config) }
}

function outcomeOf(sessions, latest, config = CONFIG) {
  const before = trackState(sessions.map(session), config)
  return applySession(before, sessionAchievement(latest, config), config)
}

describe('sessionAchievement', () => {
  it('reads the rep vector at the working load, sorted descending', () => {
    const result = sessionAchievement(at(100, 6, 5, 5), CONFIG)
    expect(result).toMatchObject({ load: 100, reps: [6, 5, 5], complete: true })
  })

  it('takes the heaviest load that carried a successful set as the baseline', () => {
    // 95×4 is below the rep floor, so it neither counts nor drags the baseline
    // down; 105×5 is a successful set, so 105 is the load.
    const sets = [set(100, 5), set(105, 5), set(95, 4)]
    expect(sessionAchievement(sets, CONFIG)).toMatchObject({ load: 105, reps: [5, 0, 0] })
  })

  it('does not let a heavier set short of the rep floor establish a baseline', () => {
    const sets = [set(100, 6), set(100, 6), set(105, 4)]
    expect(sessionAchievement(sets, CONFIG)).toMatchObject({ load: 100, reps: [6, 6, 0] })
  })

  it('caps each set at the top of the rep range', () => {
    expect(sessionAchievement(at(100, 12, 5, 5), CONFIG).reps).toEqual([8, 5, 5])
  })

  it('ignores warm-ups and uncompleted sets', () => {
    const sets = [
      { weight: 60, reps: 10, completed: true, isWarmup: true },
      set(100, 6),
      { weight: 100, reps: 8, completed: false, isWarmup: false },
    ]
    expect(sessionAchievement(sets, CONFIG)).toMatchObject({ reps: [6, 0, 0], complete: false })
  })

  it('remembers the weight attempted even when no set reached the floor', () => {
    expect(sessionAchievement(at(100, 4, 4, 3), CONFIG)).toMatchObject({ load: null, attemptedLoad: 100 })
  })
})

describe('the ladder', () => {
  it('walks up one set at a time across the whole rep range', () => {
    const ladder = [
      [[5, 5, 5], [6, 5, 5]],
      [[6, 5, 5], [6, 6, 5]],
      [[6, 6, 5], [6, 6, 6]],
      [[6, 6, 6], [7, 6, 6]],
      [[7, 6, 6], [7, 7, 6]],
      [[7, 7, 6], [7, 7, 7]],
      [[7, 7, 7], [8, 7, 7]],
      [[8, 7, 7], [8, 8, 7]],
      [[8, 8, 7], [8, 8, 8]],
    ]
    for (const [performed, expected] of ladder) {
      const { next } = prescribe([at(100, ...performed)])
      expect(next.repsPerSet, `after ${performed.join('/')}`).toEqual(expected)
      expect(next.load).toBe(100)
    }
  })

  it('does not treat 6/5/5 against a 6/6/6 target as a failure', () => {
    const result = outcomeOf([at(100, 5, 5, 5)], at(100, 6, 5, 5))
    expect(result.outcome).toBe(OUTCOME.progress)
    expect(result.state.noProgressStreak).toBe(0)
    const { next } = prescribe([at(100, 5, 5, 5), at(100, 6, 5, 5)])
    expect(next.repsPerSet).toEqual([6, 6, 5])
  })

  it('increases the load and restarts at the bottom once every set is at the top', () => {
    const { next } = prescribe([at(100, 8, 8, 8)])
    expect(next.levelCompleted).toBe(true)
    expect(next.load).toBe(102.5)
    expect(next.repsPerSet).toEqual([5, 5, 5])
  })

  it('keeps laddering at the new load rather than assuming every set lands', () => {
    const { next } = prescribe([at(100, 8, 8, 8), at(102.5, 5, 5, 5)])
    expect(next.load).toBe(102.5)
    expect(next.repsPerSet).toEqual([6, 5, 5])
  })
})

describe('actual performance overrides the prescription', () => {
  it('banks an over-target set instead of asking the athlete to prove the planned step', () => {
    // Target was 100×6; performing 8/7/6 demonstrates 8 and 7, so the next
    // step is the third set at 7 — not 7/7/7, which is already behind.
    const { next } = prescribe([at(100, 6, 6, 6), at(100, 8, 7, 6)])
    expect(next.repsPerSet).toEqual([8, 7, 7])
  })

  it('counts a single set improving as progress even when another set drops', () => {
    // 8/6/5 after 7/6/6: one more successful set at 8 reps. Fewer total reps,
    // but a set was demonstrated that never had been.
    const result = outcomeOf([at(100, 7, 6, 6)], at(100, 8, 6, 5))
    expect(result.outcome).toBe(OUTCOME.progress)
    expect(result.state.reps).toEqual([8, 6, 6])
  })

  it('never lets a lighter back-off set erase a heavier performance', () => {
    const result = outcomeOf([at(100, 7, 7, 7)], at(90, 8, 8, 8))
    expect(result.state.load).toBe(100)
    expect(result.state.reps).toEqual([7, 7, 7])
    expect(result.outcome).toBe(OUTCOME.noProgress)
  })
})

describe('manually taking a heavier weight', () => {
  it('makes the heaviest successful load the new baseline and targets it across all sets', () => {
    const { next } = prescribe([at(100, 6, 6, 6), [set(100, 5), set(105, 5), set(95, 4)]])
    expect(next.load).toBe(105)
    expect(next.repsPerSet).toEqual([5, 5, 5])
    expect(next.consolidating).toBe(true)
  })

  it('is progress, not a failure, despite the lower reps', () => {
    const result = outcomeOf([at(100, 6, 6, 6)], [set(100, 5), set(105, 5), set(95, 4)])
    expect(result.outcome).toBe(OUTCOME.progress)
  })

  it('ignores a heavier attempt that fell short of the rep floor', () => {
    const { next } = prescribe([at(100, 6, 6, 6), [set(100, 6), set(100, 6), set(105, 4)]])
    expect(next.load).toBe(100)
  })
})

describe('no-progress streak and deload', () => {
  it('does not deload after a single session without progress', () => {
    const { state, next } = prescribe([at(100, 7, 6, 6), at(100, 7, 6, 6)])
    expect(state.noProgressStreak).toBe(1)
    expect(next.load).toBe(100)
  })

  it('unloads after three consecutive no-progress sessions', () => {
    const flat = at(100, 7, 6, 6)
    const { state, next } = prescribe([flat, flat, flat, flat])
    expect(state.deloadedFrom).toBe(100)
    expect(next.load).toBe(90)
    expect(next.repsPerSet).toEqual([5, 5, 5])
  })

  it('resets the counter on any genuine progression', () => {
    // The user's own example: 7/6/6, 7/6/6, 7/6/6, 7/7/6.
    const flat = at(100, 7, 6, 6)
    const { state } = prescribe([flat, flat, flat, at(100, 7, 7, 6)])
    expect(state.noProgressStreak).toBe(0)
    expect(state.reps).toEqual([7, 7, 6])
  })

  it('builds back up from the deloaded weight', () => {
    const flat = at(100, 7, 6, 6)
    const { next } = prescribe([flat, flat, flat, flat, at(90, 5, 5, 5)])
    expect(next.load).toBe(90)
    expect(next.repsPerSet).toEqual([6, 5, 5])
  })
})

describe('incomplete sessions', () => {
  it('does not count a skipped set toward the deload streak', () => {
    const result = outcomeOf([at(100, 7, 6, 6)], at(100, 6, 6))
    expect(result.outcome).toBe(OUTCOME.incomplete)
    expect(result.state.noProgressStreak).toBe(0)
  })

  it('still banks what a short session demonstrated', () => {
    const result = outcomeOf([at(100, 7, 6, 6)], at(100, 8, 8))
    expect(result.outcome).toBe(OUTCOME.progress)
    expect(result.state.reps).toEqual([8, 8, 6])
  })

  it('never lets three short sessions trigger an unload', () => {
    const short = at(100, 6, 6)
    const { state, next } = prescribe([at(100, 7, 6, 6), short, short, short, short])
    expect(state.noProgressStreak).toBe(0)
    expect(next.load).toBe(100)
  })
})

describe('edge cases', () => {
  it('collapses to plain linear loading when repsMin equals repsMax', () => {
    const config = { ...CONFIG, repsMin: 5, repsMax: 5, increment: 5 }
    const { next } = prescribe([at(100, 5, 5, 5)], config)
    expect(next.levelCompleted).toBe(true)
    expect(next.load).toBe(105)
  })

  it('holds the weight and targets the floor when no set reached the rep range', () => {
    const { next } = prescribe([at(100, 4, 4, 3)])
    expect(next.load).toBe(100)
    expect(next.repsPerSet).toEqual([5, 5, 5])
  })

  it('asks for a harder variation instead of adding load to bodyweight work', () => {
    const { next } = prescribe([at(0, 8, 8, 8)])
    expect(next.load).toBe(0)
    expect(next.needsProgressionOverload).toBe(true)
    expect(next.repsPerSet).toEqual([8, 8, 8])
  })

  it('clamps a rep vector carried over from a different set count up to the floor', () => {
    const state = trackState([session(at(100, 6, 6, 6))], CONFIG)
    const widened = { ...CONFIG, targetSets: 4 }
    expect(nextPrescription(state, widened).repsPerSet).toEqual([6, 6, 6, 5])
  })

  it('returns no prescription for a track with nothing logged', () => {
    expect(nextPrescription(emptyState(), CONFIG)).toBeNull()
  })

  it('survives floating-point loading (2.5kg jumps)', () => {
    const { next } = prescribe([at(102.5, 8, 8, 8)])
    expect(next.load).toBe(105)
  })
})

describe('rebuilding after a break', () => {
  // 100kg at 7/6/6 before a two-week holiday.
  const before = at(100, 7, 6, 6)
  const afterBreak = (sessions, breakDays = 15) => [
    { entry: { sets: before } },
    ...sessions.map((sets, i) => ({ entry: { sets }, breakDays: i === 0 ? breakDays : 0 })),
  ]
  const rebuildFrom = (sessions, { pending = 0, breakDays } = {}) => {
    const state = trackState(afterBreak(sessions, breakDays), CONFIG, { pendingBreakDays: pending })
    return { state, next: nextPrescription(state, CONFIG) }
  }

  it('eases back in at a lighter load with the reps shown before the break', () => {
    const { state, next } = rebuildFrom([], { pending: 15 })
    expect(next.load).toBe(90)
    expect(next.repsPerSet).toEqual([7, 6, 6])
    expect(next.rebuilding).toMatchObject({ step: 1, of: 2, fromLoad: 100, breakDays: 15 })
    // The pre-break level is kept as the target, not overwritten.
    expect(state.load).toBe(100)
    expect(state.reps).toEqual([7, 6, 6])
  })

  it('leaves a short gap alone', () => {
    const { next } = rebuildFrom([], { pending: 8 })
    expect(next.rebuilding).toBeUndefined()
    expect(next.load).toBe(100)
  })

  it('steps back up to the pre-break load, then resumes the ladder', () => {
    expect(rebuildFrom([at(90, 7, 6, 6)]).next).toMatchObject({ load: 95, rebuilding: { step: 2 } })
    const { state, next } = rebuildFrom([at(90, 7, 6, 6), at(95, 7, 6, 6)])
    expect(state.rebuild).toBeNull()
    expect(next.load).toBe(100)
    expect(next.repsPerSet).toEqual([7, 7, 6])
  })

  it('reports a cleared step as rebuilding, not as falling short of pre-break form', () => {
    const prior = trackState(afterBreak([]), CONFIG, { pendingBreakDays: 15 })
    const result = applySession(prior, sessionAchievement(at(90, 7, 6, 6), CONFIG), CONFIG)
    expect(result.outcome).toBe(OUTCOME.rebuilding)
    expect(result.rebuildCleared).toBe(90)
  })

  it('ends the rebuild at once when the pre-break weight is lifted', () => {
    const prior = trackState(afterBreak([]), CONFIG, { pendingBreakDays: 15 })
    const result = applySession(prior, sessionAchievement(at(100, 7, 6, 6), CONFIG), CONFIG)
    expect(result.rebuildEnded).toBe(true)
    expect(result.state.rebuild).toBeNull()
  })

  it('treats beating pre-break form during the rebuild as ordinary progress', () => {
    const prior = trackState(afterBreak([]), CONFIG, { pendingBreakDays: 15 })
    const result = applySession(prior, sessionAchievement(at(100, 8, 6, 6), CONFIG), CONFIG)
    expect(result.outcome).toBe(OUTCOME.progress)
    expect(result.rebuildEnded).toBe(true)
    expect(result.state.reps).toEqual([8, 6, 6])
  })

  it('skips steps the session already lifted past', () => {
    const { next } = rebuildFrom([at(95, 7, 6, 6)])
    expect(next.rebuilding).toBeUndefined()
    expect(next.load).toBe(100)
  })

  it('holds the step after missing it, without unloading on one bad day', () => {
    const { state, next } = rebuildFrom([at(90, 6, 6, 5)])
    expect(state.noProgressStreak).toBe(1)
    expect(next.load).toBe(90)
  })

  it('unloads from the rebuild weight after three misses in a row', () => {
    const miss = at(90, 6, 6, 5)
    const { state, next } = rebuildFrom([miss, miss, miss])
    expect(state.deloadedFrom).toBe(90)
    expect(state.rebuild).toBeNull()
    expect(next.load).toBe(81)
  })

  it('does not count a session cut short during the rebuild', () => {
    const { state, next } = rebuildFrom([at(90, 7, 6)])
    expect(state.noProgressStreak).toBe(0)
    expect(next.load).toBe(90)
  })

  it('clears a pre-break no-progress streak', () => {
    const flat = at(100, 7, 6, 6)
    const state = trackState(
      [{ entry: { sets: flat } }, { entry: { sets: flat } }, { entry: { sets: flat } }],
      CONFIG,
      { pendingBreakDays: 15 },
    )
    expect(state.noProgressStreak).toBe(0)
    expect(nextPrescription(state, CONFIG).load).toBe(90)
  })

  it('eases in harder after a longer break', () => {
    const { next } = rebuildFrom([], { pending: 40 })
    expect(next.load).toBe(80)
    expect(next.rebuilding.of).toBe(4)
  })

  it('has no load to ease for bodyweight work', () => {
    const state = trackState([{ entry: { sets: at(0, 8, 7, 7) } }], CONFIG, { pendingBreakDays: 15 })
    expect(state.rebuild).toBeNull()
  })
})
