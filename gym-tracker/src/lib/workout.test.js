import { describe, it, expect } from 'vitest'
import {
  estimateOneRepMax,
  workingSets,
  bestSet,
  totalVolume,
  averageRPE,
  findLastEntry,
  findEntryHistory,
} from './workout.js'

describe('estimateOneRepMax', () => {
  it('returns the weight itself for a single rep', () => {
    expect(estimateOneRepMax(100, 1)).toBe(100)
  })

  it('applies the Epley formula for multiple reps', () => {
    expect(estimateOneRepMax(100, 10)).toBeCloseTo(100 * (1 + 10 / 30))
  })

  it('returns 0 for missing weight or reps', () => {
    expect(estimateOneRepMax(0, 5)).toBe(0)
    expect(estimateOneRepMax(100, 0)).toBe(0)
  })
})

describe('workingSets', () => {
  it('excludes warmups and incomplete sets', () => {
    const sets = [
      { weight: 40, reps: 10, isWarmup: true, completed: true },
      { weight: 100, reps: 5, isWarmup: false, completed: true },
      { weight: 100, reps: 5, isWarmup: false, completed: false },
    ]
    expect(workingSets(sets)).toEqual([{ weight: 100, reps: 5, isWarmup: false, completed: true }])
  })

  it('handles missing input', () => {
    expect(workingSets(undefined)).toEqual([])
  })
})

describe('bestSet', () => {
  it('picks the set with the highest estimated 1RM', () => {
    const sets = [
      { weight: 100, reps: 5, completed: true },
      { weight: 110, reps: 3, completed: true },
      { weight: 90, reps: 8, completed: true },
    ]
    expect(bestSet(sets).weight).toBe(110)
  })

  it('returns null when there are no working sets', () => {
    expect(bestSet([])).toBeNull()
  })
})

describe('totalVolume', () => {
  it('sums weight times reps for working sets only', () => {
    const sets = [
      { weight: 100, reps: 5, completed: true },
      { weight: 100, reps: 5, completed: true },
      { weight: 40, reps: 10, isWarmup: true, completed: true },
    ]
    expect(totalVolume(sets)).toBe(1000)
  })
})

describe('averageRPE', () => {
  it('averages rpe across working sets', () => {
    const sets = [
      { weight: 100, reps: 5, completed: true, rpe: 7 },
      { weight: 100, reps: 5, completed: true, rpe: 9 },
    ]
    expect(averageRPE(sets)).toBe(8)
  })

  it('returns null when no set has an rpe', () => {
    expect(averageRPE([{ weight: 100, reps: 5, completed: true }])).toBeNull()
  })
})

function makeLog(date, exerciseId, sets) {
  return { id: `log-${date}`, date, entries: [{ exerciseId, exerciseName: 'Test', sets }] }
}

describe('findLastEntry / findEntryHistory', () => {
  const sets = [{ weight: 100, reps: 5, completed: true }]
  const logs = [
    makeLog('2026-01-01', 'squat', sets),
    makeLog('2026-01-08', 'squat', sets),
    makeLog('2026-01-15', 'bench', sets),
  ]

  it('finds the most recent entry for an exercise', () => {
    const result = findLastEntry(logs, 'squat')
    expect(result.log.date).toBe('2026-01-08')
  })

  it('returns null when the exercise was never logged', () => {
    expect(findLastEntry(logs, 'deadlift')).toBeNull()
  })

  it('returns history oldest-to-newest, capped at the limit', () => {
    const history = findEntryHistory(logs, 'squat', 10)
    expect(history.map((h) => h.date)).toEqual(['2026-01-01', '2026-01-08'])
  })
})
