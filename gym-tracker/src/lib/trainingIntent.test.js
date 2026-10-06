import { describe, it, expect } from 'vitest'
import { planScheme, entryScheme, inferSchemeFromSets, sameTrack } from './trainingIntent.js'

const set = (weight, reps) => ({ weight, reps, completed: true, isWarmup: false })

describe('planScheme', () => {
  it('reads the planned rep range', () => {
    expect(planScheme({ repsMin: 8, repsMax: 12 })).toMatchObject({ repsMin: 8, repsMax: 12, inferred: false })
  })

  it('returns null when the plan has no usable range', () => {
    expect(planScheme(null)).toBeNull()
    expect(planScheme({ repsMin: 0, repsMax: 0 })).toBeNull()
  })

  it('tolerates a range entered backwards', () => {
    expect(planScheme({ repsMin: 12, repsMax: 8 })).toMatchObject({ repsMin: 8, repsMax: 12 })
  })
})

describe('inferSchemeFromSets', () => {
  it('derives the range from the reps actually logged', () => {
    expect(inferSchemeFromSets([set(100, 5), set(100, 5)])).toMatchObject({ repsMin: 5, repsMax: 5, inferred: true })
  })

  it('ignores lighter ramp-up sets so they do not widen the range', () => {
    expect(inferSchemeFromSets([set(80, 12), set(100, 5), set(100, 5)])).toMatchObject({ repsMin: 5, repsMax: 5 })
  })

  it('ignores warm-ups and uncompleted sets', () => {
    const sets = [
      { weight: 60, reps: 10, completed: true, isWarmup: true },
      set(100, 5),
      { weight: 100, reps: 20, completed: false, isWarmup: false },
    ]
    expect(inferSchemeFromSets(sets)).toMatchObject({ repsMin: 5, repsMax: 5 })
  })

  it('returns null when nothing was logged', () => {
    expect(inferSchemeFromSets([])).toBeNull()
  })
})

describe('entryScheme', () => {
  it('prefers the scheme recorded on the log over the reps that came out', () => {
    const entry = { scheme: { repsMin: 5, repsMax: 5 }, sets: [set(100, 3)] }
    expect(entryScheme(entry)).toMatchObject({ repsMin: 5, repsMax: 5, inferred: false })
  })

  it('falls back to the reps for logs saved before schemes were recorded', () => {
    expect(entryScheme({ sets: [set(100, 12)] })).toMatchObject({ repsMin: 12, repsMax: 12, inferred: true })
  })
})

describe('sameTrack', () => {
  const strength = planScheme({ repsMin: 5, repsMax: 5 })
  const hypertrophy = planScheme({ repsMin: 10, repsMax: 15 })

  it('keeps a 5-rep strength prescription and a 10-15 hypertrophy one apart', () => {
    expect(sameTrack(strength, hypertrophy)).toBe(false)
  })

  it('treats the prescribed range as the track identity, so 5-8 and 4-7 differ', () => {
    expect(sameTrack(planScheme({ repsMin: 5, repsMax: 8 }), planScheme({ repsMin: 4, repsMax: 7 }))).toBe(false)
  })

  it('does not merely overlapping ranges into one track', () => {
    expect(sameTrack(hypertrophy, planScheme({ repsMin: 8, repsMax: 12 }))).toBe(false)
  })

  it('matches an identical prescribed range', () => {
    expect(sameTrack(planScheme({ repsMin: 5, repsMax: 8 }), planScheme({ repsMin: 5, repsMax: 8 }))).toBe(true)
  })

  it('adopts a pre-scheme log whose reps fit the prescription', () => {
    expect(sameTrack(planScheme({ repsMin: 5, repsMax: 8 }), inferSchemeFromSets([set(100, 6), set(100, 5)]))).toBe(true)
  })

  it('adopts a pre-scheme log that missed a rep below the floor', () => {
    expect(sameTrack(strength, inferSchemeFromSets([set(100, 5), set(100, 3)]))).toBe(true)
  })

  it('rejects a pre-scheme log whose reps belong to a higher-rep prescription', () => {
    expect(sameTrack(strength, inferSchemeFromSets([set(60, 12), set(60, 12)]))).toBe(false)
  })

  it('rejects a pre-scheme log far below a high-rep prescription', () => {
    expect(sameTrack(hypertrophy, inferSchemeFromSets([set(100, 5), set(100, 5)]))).toBe(false)
  })

  it('matches anything when one side has no known scheme', () => {
    expect(sameTrack(strength, null)).toBe(true)
  })
})
