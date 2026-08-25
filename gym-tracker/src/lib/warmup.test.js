import { describe, it, expect } from 'vitest'
import { suggestWarmupSets } from './warmup.js'

describe('suggestWarmupSets', () => {
  it('returns an empty ramp for light or missing weight', () => {
    expect(suggestWarmupSets(0, 'kg')).toEqual([])
    expect(suggestWarmupSets('', 'kg')).toEqual([])
    expect(suggestWarmupSets(15, 'kg')).toEqual([])
  })

  it('builds a three-step ramp rounded to loadable plates', () => {
    const ramp = suggestWarmupSets(100, 'kg')
    expect(ramp).toHaveLength(3)
    expect(ramp.map((s) => s.weight)).toEqual([40, 60, 80])
    expect(ramp.map((s) => s.reps)).toEqual([10, 5, 3])
    expect(ramp.every((s) => s.isWarmup && !s.completed)).toBe(true)
  })

  it('rounds to the nearest 2.5kg step', () => {
    const ramp = suggestWarmupSets(83, 'kg')
    expect(ramp.map((s) => s.weight)).toEqual([32.5, 50, 67.5])
  })

  it('uses 5-unit steps for lb', () => {
    const ramp = suggestWarmupSets(225, 'lb')
    expect(ramp.map((s) => s.weight)).toEqual([90, 135, 180])
  })

  it('never suggests below one step even for very light ramp fractions', () => {
    const ramp = suggestWarmupSets(20, 'kg')
    expect(ramp.every((s) => s.weight >= 2.5)).toBe(true)
  })
})
