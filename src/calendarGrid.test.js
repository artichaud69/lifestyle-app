import { describe, it, expect } from 'vitest'
import { buildMonthGrid, weekdayLabels, addMonths, entryYears, MONTH_NAMES } from './calendarGrid.js'

const MONDAY_START = 1

describe('weekdayLabels', () => {
  it('starts on Monday when the week does', () => {
    expect(weekdayLabels(MONDAY_START)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S'])
  })

  it('starts on Sunday when the week does', () => {
    expect(weekdayLabels(0)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S'])
  })
})

describe('buildMonthGrid', () => {
  it('lays every day out in full weeks of seven', () => {
    const weeks = buildMonthGrid(2026, 7, MONDAY_START) // August 2026
    expect(weeks.every((week) => week.length === 7)).toBe(true)
  })

  it('includes each day of the month exactly once, in order', () => {
    const days = buildMonthGrid(2026, 7, MONDAY_START)
      .flat()
      .filter(Boolean)
      .map((cell) => cell.day)
    expect(days).toEqual(Array.from({ length: 31 }, (_, index) => index + 1))
  })

  it('pads the start so the first day lands on its real weekday', () => {
    // 2026-08-01 is a Saturday: five blanks before it in a Monday-start week.
    const [firstWeek] = buildMonthGrid(2026, 7, MONDAY_START)
    expect(firstWeek.slice(0, 5).every((cell) => cell === null)).toBe(true)
    expect(firstWeek[5]).toEqual({ date: '2026-08-01', day: 1 })
  })

  it('needs no padding when the month opens on the first weekday', () => {
    // 2026-06-01 is a Monday.
    const [firstWeek] = buildMonthGrid(2026, 5, MONDAY_START)
    expect(firstWeek[0]).toEqual({ date: '2026-06-01', day: 1 })
  })

  it('handles a short month', () => {
    const days = buildMonthGrid(2026, 1, MONDAY_START).flat().filter(Boolean)
    expect(days).toHaveLength(28)
    expect(days.at(-1).date).toBe('2026-02-28')
  })

  it('handles a leap February', () => {
    const days = buildMonthGrid(2028, 1, MONDAY_START).flat().filter(Boolean)
    expect(days).toHaveLength(29)
    expect(days.at(-1).date).toBe('2028-02-29')
  })
})

describe('addMonths', () => {
  it('steps forward within a year', () => {
    expect(addMonths(2026, 7, 1)).toEqual({ year: 2026, month: 8 })
  })

  it('rolls over into the next year', () => {
    expect(addMonths(2026, 11, 1)).toEqual({ year: 2027, month: 0 })
  })

  it('rolls back into the previous year', () => {
    expect(addMonths(2026, 0, -1)).toEqual({ year: 2025, month: 11 })
  })

  it('handles jumps larger than a year', () => {
    expect(addMonths(2026, 0, -13)).toEqual({ year: 2024, month: 11 })
  })
})

describe('entryYears', () => {
  it('collects the distinct years that have entries', () => {
    const years = entryYears({ '2025-06-15': {}, '2026-01-05': {}, '2026-08-12': {} })
    expect([...years].sort()).toEqual([2025, 2026])
  })

  it('is empty when there are no entries', () => {
    expect(entryYears({}).size).toBe(0)
  })
})

describe('MONTH_NAMES', () => {
  it('has twelve months starting at January', () => {
    expect(MONTH_NAMES).toHaveLength(12)
    expect(MONTH_NAMES[0]).toBe('January')
    expect(MONTH_NAMES[11]).toBe('December')
  })
})
