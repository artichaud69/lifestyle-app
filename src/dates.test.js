import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { toISODate, todayISO, lastNDates, startOfWeek, datesBetween, addDays } from './dates.js'

// 2026-08-13 is a Thursday, so week boundaries are easy to reason about.
const TODAY = new Date(2026, 7, 13, 12, 0, 0)

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(TODAY)
})

afterEach(() => {
  vi.useRealTimers()
})

describe('toISODate', () => {
  it('formats a local date without shifting timezone', () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('pads single-digit months and days', () => {
    expect(toISODate(new Date(2026, 8, 9))).toBe('2026-09-09')
  })

  it('uses local time rather than UTC, even late at night', () => {
    // A UTC-based implementation would roll this to the next day for
    // anyone east of Greenwich.
    expect(toISODate(new Date(2026, 7, 13, 23, 30))).toBe('2026-08-13')
  })
})

describe('todayISO', () => {
  it('reports the mocked current day', () => {
    expect(todayISO()).toBe('2026-08-13')
  })
})

describe('lastNDates', () => {
  it('returns n days ending today, oldest first', () => {
    expect(lastNDates(3)).toEqual(['2026-08-11', '2026-08-12', '2026-08-13'])
  })
})

describe('addDays', () => {
  it('steps forward', () => {
    expect(addDays('2026-08-13', 1)).toBe('2026-08-14')
  })

  it('steps backward', () => {
    expect(addDays('2026-08-13', -1)).toBe('2026-08-12')
  })

  it('is a no-op for zero', () => {
    expect(addDays('2026-08-13', 0)).toBe('2026-08-13')
  })

  it('crosses a month boundary in both directions', () => {
    expect(addDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addDays('2026-09-01', -1)).toBe('2026-08-31')
  })

  it('crosses a year boundary', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })

  it('lands on a leap day correctly', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
  })
})

describe('startOfWeek', () => {
  it('snaps back to Monday', () => {
    expect(startOfWeek('2026-08-13', 1)).toBe('2026-08-10')
  })

  it('leaves a Monday untouched', () => {
    expect(startOfWeek('2026-08-10', 1)).toBe('2026-08-10')
  })

  it('treats Sunday as the end of the previous week', () => {
    expect(startOfWeek('2026-08-09', 1)).toBe('2026-08-03')
  })

  it('crosses a month boundary', () => {
    expect(startOfWeek('2026-08-01', 1)).toBe('2026-07-27')
  })
})

describe('datesBetween', () => {
  it('includes both endpoints', () => {
    expect(datesBetween('2026-08-11', '2026-08-13')).toEqual([
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
    ])
  })

  it('returns a single day when start equals end', () => {
    expect(datesBetween('2026-08-13', '2026-08-13')).toEqual(['2026-08-13'])
  })

  it('returns nothing when the range is backwards', () => {
    expect(datesBetween('2026-08-13', '2026-08-11')).toEqual([])
  })

  it('spans month and year boundaries', () => {
    expect(datesBetween('2025-12-30', '2026-01-02')).toEqual([
      '2025-12-30',
      '2025-12-31',
      '2026-01-01',
      '2026-01-02',
    ])
  })

  it('handles a leap day', () => {
    expect(datesBetween('2028-02-28', '2028-03-01')).toEqual([
      '2028-02-28',
      '2028-02-29',
      '2028-03-01',
    ])
  })
})
