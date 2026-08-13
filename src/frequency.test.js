import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { datesBetween } from './dates.js'
import { weeksList, countsByWeek, isCompleteWeek, weeklyCompletionPercent, DAILY } from './frequency.js'

// Thursday. Current (incomplete) week runs Mon 2026-08-10 to Sun 2026-08-16.
const TODAY = new Date(2026, 7, 13, 12, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(TODAY)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('weeksList', () => {
  it('lists each Monday touched between the start date and today', () => {
    expect(weeksList('2026-08-03')).toEqual(['2026-08-03', '2026-08-10'])
  })

  it('includes the partial first week when the habit started mid-week', () => {
    // 2026-08-01 is a Saturday, so its week began on Mon 2026-07-27.
    expect(weeksList('2026-08-01')).toEqual(['2026-07-27', '2026-08-03', '2026-08-10'])
  })

  it('returns just this week for a habit started today', () => {
    expect(weeksList('2026-08-13')).toEqual(['2026-08-10'])
  })
})

describe('countsByWeek', () => {
  it('groups completions into their Monday-start weeks', () => {
    expect(countsByWeek(['2026-08-03', '2026-08-09', '2026-08-10'])).toEqual({
      '2026-08-03': 2,
      '2026-08-10': 1,
    })
  })

  it('returns an empty map for no completions', () => {
    expect(countsByWeek([])).toEqual({})
  })
})

describe('isCompleteWeek', () => {
  it('never counts the current week, which is still in progress', () => {
    expect(isCompleteWeek('2026-08-10', '2026-08-03')).toBe(false)
  })

  it('does not count a first week the habit only partly covered', () => {
    // started Saturday, so Mon-Fri of that week were never expected
    expect(isCompleteWeek('2026-07-27', '2026-08-01')).toBe(false)
  })

  it('does count a first week the habit covered from its Monday', () => {
    expect(isCompleteWeek('2026-08-03', '2026-08-03')).toBe(true)
  })

  it('counts an ordinary past week', () => {
    expect(isCompleteWeek('2026-08-03', '2026-07-20')).toBe(true)
  })
})

describe('weeklyCompletionPercent', () => {
  it('is 100% when every full week hit the target', () => {
    const done = datesBetween('2026-08-03', '2026-08-09') // 7 days, the one full week
    expect(weeklyCompletionPercent('2026-08-03', done, DAILY)).toBe(100)
  })

  it('ignores a short current week rather than counting it as a miss', () => {
    // Nothing done this week, but the full week was perfect.
    const done = datesBetween('2026-08-03', '2026-08-09')
    expect(weeklyCompletionPercent('2026-08-03', done, DAILY)).toBe(100)
  })

  it('averages partial completion across full weeks', () => {
    // Target 4x/week; 2 of 4 done in the only full week.
    const done = ['2026-08-03', '2026-08-04']
    expect(weeklyCompletionPercent('2026-08-03', done, 4)).toBe(50)
  })

  it('caps a week that overshoots its target at 100%', () => {
    const done = datesBetween('2026-08-03', '2026-08-09') // 7 done against a 3x target
    expect(weeklyCompletionPercent('2026-08-03', done, 3)).toBe(100)
  })

  it('falls back to the partial weeks when no full week exists yet', () => {
    // Started today, so there is nothing complete to average.
    expect(weeklyCompletionPercent('2026-08-13', ['2026-08-13'], 1)).toBe(100)
  })

  it('is 0% when nothing was ever done', () => {
    expect(weeklyCompletionPercent('2026-08-03', [], DAILY)).toBe(0)
  })
})
