import { describe, it, expect } from 'vitest'
import { planScheme, entryScheme, inferSchemeFromSets, schemeGap, schemesAlign } from './trainingIntent.js'

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

describe('schemesAlign', () => {
  const strength = planScheme({ repsMin: 5, repsMax: 5 })
  const hypertrophy = planScheme({ repsMin: 10, repsMax: 15 })

  it('keeps a 5-rep strength scheme and a 10-15 hypertrophy scheme apart', () => {
    expect(schemeGap(strength, hypertrophy)).toBe(5)
    expect(schemesAlign(strength, hypertrophy)).toBe(false)
  })

  it('treats overlapping ranges as the same work', () => {
    expect(schemesAlign(hypertrophy, planScheme({ repsMin: 8, repsMax: 12 }))).toBe(true)
  })

  it('allows one rep of slack between neighbouring prescriptions', () => {
    expect(schemesAlign(strength, planScheme({ repsMin: 6, repsMax: 8 }))).toBe(true)
    expect(schemesAlign(strength, planScheme({ repsMin: 7, repsMax: 9 }))).toBe(false)
  })

  it('gives inferred schemes more slack, so a missed rep is not a different intent', () => {
    expect(schemesAlign(strength, inferSchemeFromSets([set(100, 3)]))).toBe(true)
  })

  it('aligns with anything when one side has no known scheme', () => {
    expect(schemesAlign(strength, null)).toBe(true)
  })
})
