import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { datesBetween } from './dates.js'
import { currentStreak, bestStreak } from './streaks.js'
import { DAILY } from './frequency.js'

// Thursday of an in-progress week (Mon 2026-08-10 to Sun 2026-08-16).
const TODAY = new Date(2026, 7, 13, 12, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(TODAY)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('currentStreak', () => {
  it('counts consecutive weeks that met the target', () => {
    const done = datesBetween('2026-07-27', '2026-08-09') // two full weeks, every day
    expect(currentStreak('2026-07-27', done, DAILY)).toBe(2)
  })

  it('survives an incomplete current week', () => {
    // The current week cannot possibly be finished yet, so it must not
    // break a streak earned in prior weeks.
    const done = datesBetween('2026-08-03', '2026-08-09')
    expect(currentStreak('2026-08-03', done, DAILY)).toBe(1)
  })

  it('counts the current week once it already hit the target', () => {
    const done = [...datesBetween('2026-08-03', '2026-08-09'), '2026-08-10', '2026-08-11']
    expect(currentStreak('2026-08-03', done, 2)).toBe(2)
  })

  it('breaks on a full week that missed the target', () => {
    // Perfect first week, nothing in the second full week.
    const done = datesBetween('2026-07-27', '2026-08-02')
    expect(currentStreak('2026-07-27', done, DAILY)).toBe(0)
  })

  it('does not break on a short first week', () => {
    // Started Saturday 2026-08-01, so Mon-Fri of that week were never expected.
    const done = ['2026-08-01', '2026-08-02', ...datesBetween('2026-08-03', '2026-08-09')]
    expect(currentStreak('2026-08-01', done, DAILY)).toBe(1)
  })

  it('is 0 with no completions at all', () => {
    expect(currentStreak('2026-07-27', [], DAILY)).toBe(0)
  })
})

describe('bestStreak', () => {
  it('remembers the longest run even after it is broken', () => {
    const done = [
      ...datesBetween('2026-07-13', '2026-07-26'), // two perfect weeks
      // week of 2026-07-27 missed entirely
      ...datesBetween('2026-08-03', '2026-08-09'), // one more perfect week
    ]
    expect(bestStreak('2026-07-13', done, DAILY)).toBe(2)
    expect(currentStreak('2026-07-13', done, DAILY)).toBe(1)
  })

  it('matches the current streak when nothing has broken yet', () => {
    const done = datesBetween('2026-07-27', '2026-08-09')
    expect(bestStreak('2026-07-27', done, DAILY)).toBe(2)
  })

  it('is 0 with no completions at all', () => {
    expect(bestStreak('2026-07-27', [], DAILY)).toBe(0)
  })
})
