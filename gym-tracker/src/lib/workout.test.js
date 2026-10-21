import { describe, it, expect } from 'vitest'
import {
  estimateOneRepMax,
  workingSets,
  bestSet,
  totalVolume,
  averageRPE,
  findLastEntry,
  findEntryHistory,
  formatWorkoutAsText,
  mergeEntriesByExercise,
  setOneRepMax,
  oneRepMaxContext,
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

describe('formatWorkoutAsText', () => {
  const log = {
    sessionName: 'Full Body A',
    date: '2026-01-08',
    startedAt: '2026-01-08T10:00:00.000Z',
    finishedAt: '2026-01-08T10:45:00.000Z',
    notes: 'Felt strong today',
    entries: [
      {
        exerciseId: 'back-squat',
        exerciseName: 'Back Squat',
        sets: [
          { weight: 40, reps: 10, rpe: null, isWarmup: true, completed: true },
          { weight: 100, reps: 5, rpe: 8, isWarmup: false, completed: true },
          { weight: 100, reps: 5, rpe: 8.5, isWarmup: false, completed: true },
          { weight: 100, reps: 4, rpe: null, isWarmup: false, completed: false },
        ],
      },
    ],
  }

  it('includes the session name, date, and duration', () => {
    const text = formatWorkoutAsText(log, 'kg')
    expect(text).toContain('Full Body A')
    expect(text).toContain('Duration: 45 min')
  })

  it('labels warm-ups separately and numbers working sets from 1', () => {
    const text = formatWorkoutAsText(log, 'kg')
    expect(text).toContain('Warm-up: 40kg × 10')
    expect(text).toContain('Set 1: 100kg × 5 @ RPE 8')
    expect(text).toContain('Set 2: 100kg × 5 @ RPE 8.5')
  })

  it('excludes sets that were never marked complete', () => {
    expect(formatWorkoutAsText(log, 'kg')).not.toContain('× 4')
  })

  it('includes the best-set estimated 1RM and total volume', () => {
    const text = formatWorkoutAsText(log, 'kg')
    expect(text).toContain('Best set est. 1RM:')
    expect(text).toContain('Total volume: 1000kg')
  })

  it('includes notes when present', () => {
    expect(formatWorkoutAsText(log, 'kg')).toContain('Notes: Felt strong today')
  })

  it('omits the notes line when there are none', () => {
    expect(formatWorkoutAsText({ ...log, notes: '' }, 'kg')).not.toContain('Notes:')
  })
})

describe('mergeEntriesByExercise', () => {
  it('leaves entries for distinct exercises untouched', () => {
    const entries = [
      { exerciseId: 'a', exerciseName: 'A', sets: [{ weight: 10, reps: 5, completed: true }] },
      { exerciseId: 'b', exerciseName: 'B', sets: [{ weight: 20, reps: 5, completed: true }] },
    ]
    expect(mergeEntriesByExercise(entries)).toEqual(entries)
  })

  it('combines sets from duplicate entries for the same exercise, preserving order', () => {
    const entries = [
      { exerciseId: 'a', exerciseName: 'A', sets: [{ weight: 10, reps: 5, completed: true }] },
      { exerciseId: 'b', exerciseName: 'B', sets: [{ weight: 20, reps: 5, completed: true }] },
      { exerciseId: 'a', exerciseName: 'A', sets: [{ weight: 12, reps: 5, completed: true }] },
    ]
    const merged = mergeEntriesByExercise(entries)
    expect(merged).toHaveLength(2)
    expect(merged[0].exerciseId).toBe('a')
    expect(merged[0].sets).toHaveLength(2)
    expect(merged[0].sets.map((s) => s.weight)).toEqual([10, 12])
    expect(merged[1].exerciseId).toBe('b')
  })
})

describe('setOneRepMax', () => {
  const BODYWEIGHT = [{ date: '2026-10-01', weight: 87 }]
  const set = (weight, reps) => ({ weight, reps, completed: true, isWarmup: false })
  const ctx = (name, logs = BODYWEIGHT, date = '2026-10-20') => oneRepMaxContext(name, date, logs)

  describe('conventional lifts', () => {
    it('keeps the plain Epley formula on the weight logged', () => {
      expect(setOneRepMax(set(100, 5), ctx('Back Squat'))).toBeCloseTo(100 * (1 + 5 / 30))
    })

    it('ignores bodyweight entirely, even when one is on record', () => {
      expect(setOneRepMax(set(100, 5), ctx('Back Squat'))).toBe(setOneRepMax(set(100, 5)))
    })

    it('stays conventional for lifts that only move part of the body', () => {
      expect(setOneRepMax(set(10, 10), ctx('Push-Up'))).toBeCloseTo(10 * (1 + 10 / 30))
      expect(setOneRepMax(set(10, 10), ctx('Bench Dip'))).toBeCloseTo(10 * (1 + 10 / 30))
    })
  })

  describe('weighted pull-ups', () => {
    it('estimates on bodyweight plus the added load, then reports the added part', () => {
      // 87 + 15 = 102kg × 11 → 139.4kg total → +52.4kg added.
      const estimate = setOneRepMax(set(15, 11), ctx('Weighted Pull-Up'))
      expect(estimate + 87).toBeCloseTo(139.4, 5)
      expect(estimate).toBeCloseTo(52.4, 5)
    })

    it('no longer reports the external weight alone', () => {
      expect(setOneRepMax(set(15, 11), ctx('Weighted Pull-Up'))).not.toBeCloseTo(15 * (1 + 11 / 30))
    })

    it('returns the added weight itself for a single', () => {
      expect(setOneRepMax(set(40, 1), ctx('Weighted Pull-Up'))).toBeCloseTo(40)
    })

    it('treats dips and chin-ups the same way', () => {
      expect(setOneRepMax(set(15, 11), ctx('Dip'))).toBeCloseTo(52.4, 5)
      expect(setOneRepMax(set(15, 11), ctx('Chin-Up'))).toBeCloseTo(52.4, 5)
    })
  })

  describe('bodyweight pull-ups', () => {
    it('gives a bodyweight-only set a real estimate instead of zero', () => {
      // 87 × (1 + 10/30) − 87 = 29kg that could be added for a single.
      expect(setOneRepMax(set(0, 10), ctx('Pull-Up'))).toBeCloseTo(29, 5)
    })
  })

  describe('assisted pull-ups', () => {
    it('subtracts the assistance, and goes negative while a single still needs help', () => {
      // (87 − 30) × (1 + 8/30) − 87 ≈ −14.8: a single would need ~15kg of help.
      expect(setOneRepMax(set(30, 8), ctx('Assisted Pull-Up'))).toBeCloseTo(57 * (1 + 8 / 30) - 87, 5)
    })

    it('scores less assistance as stronger, not weaker', () => {
      const lighterHelp = setOneRepMax(set(20, 8), ctx('Assisted Pull-Up'))
      const heavierHelp = setOneRepMax(set(30, 8), ctx('Assisted Pull-Up'))
      expect(lighterHelp).toBeGreaterThan(heavierHelp)
    })

    it('has no estimate when the assistance takes the whole bodyweight', () => {
      expect(setOneRepMax(set(87, 8), ctx('Assisted Pull-Up'))).toBeNull()
    })
  })

  describe('missing bodyweight', () => {
    it('has no estimate for a bodyweight lift rather than assuming a bodyweight', () => {
      expect(setOneRepMax(set(15, 11), ctx('Weighted Pull-Up', []))).toBeNull()
      expect(setOneRepMax(set(0, 10), ctx('Pull-Up', []))).toBeNull()
    })

    it('leaves conventional lifts unaffected', () => {
      expect(setOneRepMax(set(100, 5), ctx('Back Squat', []))).toBeCloseTo(100 * (1 + 5 / 30))
    })
  })

  it('uses the bodyweight on record for the workout date', () => {
    const logs = [
      { date: '2026-01-10', weight: 80 },
      { date: '2026-06-10', weight: 87 },
    ]
    expect(oneRepMaxContext('Pull-Up', '2026-03-01', logs).bodyweight).toBe(80)
    expect(oneRepMaxContext('Pull-Up', '2026-07-01', logs).bodyweight).toBe(87)
  })
})

describe('bestSet with bodyweight', () => {
  const sets = [
    { weight: 10, reps: 5, completed: true, isWarmup: false },
    { weight: 0, reps: 12, completed: true, isWarmup: false },
  ]

  it('ranks by the total load when bodyweight is known', () => {
    // 87 × 1.4 = 121.8 beats 97 × 1.167 = 113.2: the bodyweight set is better.
    const context = oneRepMaxContext('Pull-Up', '2026-10-20', [{ date: '2026-10-01', weight: 87 }])
    expect(bestSet(sets, context)).toBe(sets[1])
  })

  it('keeps the conventional ranking without a context', () => {
    expect(bestSet(sets)).toBe(sets[0])
  })

  it('has no best set for a bodyweight lift with no bodyweight on record', () => {
    expect(bestSet(sets, oneRepMaxContext('Pull-Up', '2026-10-20', []))).toBeNull()
  })
})

describe('formatWorkoutAsText with bodyweight lifts', () => {
  const log = {
    date: '2026-10-20',
    sessionName: 'Pull',
    entries: [
      { exerciseId: 'weighted-pull-up', exerciseName: 'Weighted Pull-Up', sets: [{ weight: 15, reps: 11, completed: true, isWarmup: false }] },
      { exerciseId: 'back-squat', exerciseName: 'Back Squat', sets: [{ weight: 100, reps: 5, completed: true, isWarmup: false }] },
    ],
  }

  it('reports the added-weight estimate and the bodyweight it was made at', () => {
    const text = formatWorkoutAsText(log, 'kg', [{ date: '2026-10-01', weight: 87 }])
    expect(text).toContain('Best set est. 1RM: +52kg added (at 87kg bodyweight)')
    expect(text).toContain('Best set est. 1RM: 117kg')
  })

  it('omits the estimate for a bodyweight lift with no bodyweight logged', () => {
    const text = formatWorkoutAsText(log, 'kg', [])
    expect(text).not.toMatch(/Best set est\. 1RM: \+?\d+kg added/)
    expect(text).not.toContain('Best set est. 1RM: 21kg')
    expect(text).toContain('Best set est. 1RM: 117kg')
  })
})
