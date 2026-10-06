import { describe, it, expect } from 'vitest'
import { BREAK_MIN_DAYS, dayNumber, trainingDays, longestGapBetween, rebuildPlan, daysSinceLastWorkout } from './breaks.js'

const log = (date) => ({ date, entries: [{ exerciseId: 'x', sets: [] }] })

describe('dayNumber', () => {
  it('counts whole days between dates regardless of month boundaries', () => {
    expect(dayNumber('2026-03-01') - dayNumber('2026-02-27')).toBe(2)
  })

  it('is unaffected by daylight saving changes', () => {
    expect(dayNumber('2026-03-30') - dayNumber('2026-03-28')).toBe(2)
  })
})

describe('trainingDays', () => {
  it('lists each training day once, in order', () => {
    const logs = [log('2026-01-08'), log('2026-01-01'), log('2026-01-08')]
    expect(trainingDays(logs)).toEqual([dayNumber('2026-01-01'), dayNumber('2026-01-08')])
  })

  it('ignores logs with nothing in them', () => {
    expect(trainingDays([{ date: '2026-01-01', entries: [] }])).toEqual([])
  })
})

describe('longestGapBetween', () => {
  const days = trainingDays([log('2026-01-01'), log('2026-01-04'), log('2026-01-20'), log('2026-01-22')])

  it('finds the longest stretch without training between two days', () => {
    expect(longestGapBetween(days, dayNumber('2026-01-01'), dayNumber('2026-01-22'))).toBe(16)
  })

  it('counts the stretch up to the end day when nothing was logged after', () => {
    expect(longestGapBetween(days, dayNumber('2026-01-22'), dayNumber('2026-02-05'))).toBe(14)
  })

  it('is zero for an empty or backwards window', () => {
    expect(longestGapBetween(days, dayNumber('2026-01-22'), dayNumber('2026-01-22'))).toBe(0)
  })
})

describe('rebuildPlan', () => {
  it('leaves a missed week alone', () => {
    expect(rebuildPlan(9)).toBeNull()
  })

  it('eases a two-week holiday in over two sessions from 90%', () => {
    expect(rebuildPlan(14)).toMatchObject({ reduction: 0.1, sessions: 2 })
    expect(rebuildPlan(BREAK_MIN_DAYS)).not.toBeNull()
  })

  it('cuts deeper and steps back more slowly the longer the break', () => {
    expect(rebuildPlan(25)).toMatchObject({ reduction: 0.15, sessions: 3 })
    expect(rebuildPlan(60)).toMatchObject({ reduction: 0.2, sessions: 4 })
  })
})

describe('daysSinceLastWorkout', () => {
  it('counts days from the most recent workout of any kind', () => {
    expect(daysSinceLastWorkout([log('2026-01-01'), log('2026-01-05')], '2026-01-19')).toBe(14)
  })

  it('is null with nothing logged', () => {
    expect(daysSinceLastWorkout([], '2026-01-19')).toBeNull()
  })
})
