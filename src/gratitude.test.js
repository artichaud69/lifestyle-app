import { describe, it, expect } from 'vitest'
import {
  hasEntry,
  currentStreak,
  bestStreak,
  sameDateLastYear,
  promptForDate,
  itemsForDay,
} from './gratitude.js'

describe('itemsForDay', () => {
  it('returns the items for a day that has them', () => {
    expect(itemsForDay({ '2026-08-14': ['coffee', 'sun', ''] }, '2026-08-14')).toEqual([
      'coffee',
      'sun',
      '',
    ])
  })

  it('returns an empty array for a day with nothing saved', () => {
    expect(itemsForDay({}, '2026-08-14')).toEqual([])
  })

  it('does not choke on old or malformed data', () => {
    expect(itemsForDay({ '2026-08-14': null }, '2026-08-14')).toEqual([])
    expect(itemsForDay({ '2026-08-14': 'not an array' }, '2026-08-14')).toEqual([])
  })
})

describe('hasEntry', () => {
  it('is true once at least one item has real text', () => {
    expect(hasEntry({ '2026-08-14': ['', 'friends', ''] }, '2026-08-14')).toBe(true)
  })

  it('is false for a day of only blanks', () => {
    expect(hasEntry({ '2026-08-14': ['', '  ', ''] }, '2026-08-14')).toBe(false)
  })

  it('is false for a day with nothing saved at all', () => {
    expect(hasEntry({}, '2026-08-14')).toBe(false)
  })
})

describe('currentStreak', () => {
  it('counts back from today when today is already filled', () => {
    const entries = {
      '2026-08-14': ['a'],
      '2026-08-13': ['b'],
      '2026-08-12': ['c'],
    }
    expect(currentStreak(entries, '2026-08-14')).toBe(3)
  })

  it('does not break the streak just because today is still open', () => {
    // It's the 14th, nothing written yet today, but yesterday and the day
    // before were filled - the streak should still read 2, not 0.
    const entries = {
      '2026-08-13': ['a'],
      '2026-08-12': ['b'],
    }
    expect(currentStreak(entries, '2026-08-14')).toBe(2)
  })

  it('is zero once a day was actually skipped', () => {
    const entries = {
      '2026-08-12': ['a'],
      // 13th missing
    }
    expect(currentStreak(entries, '2026-08-14')).toBe(0)
  })

  it('is zero with no entries at all', () => {
    expect(currentStreak({}, '2026-08-14')).toBe(0)
  })

  it('walks back across a month boundary', () => {
    const entries = {
      '2026-09-01': ['a'],
      '2026-08-31': ['b'],
    }
    expect(currentStreak(entries, '2026-09-01')).toBe(2)
  })
})

describe('bestStreak', () => {
  it('finds the longest run even when it is not the most recent one', () => {
    const entries = {
      '2026-08-01': ['a'],
      '2026-08-02': ['b'],
      '2026-08-03': ['c'],
      // gap
      '2026-08-10': ['d'],
    }
    expect(bestStreak(entries, '2026-08-14')).toBe(3)
  })

  it('ignores blank-only days when measuring runs', () => {
    const entries = {
      '2026-08-01': ['a'],
      '2026-08-02': ['', ''],
      '2026-08-03': ['b'],
    }
    expect(bestStreak(entries, '2026-08-14')).toBe(1)
  })

  it('is zero with nothing filled in', () => {
    expect(bestStreak({}, '2026-08-14')).toBe(0)
  })

  it('does not count a future-dated entry towards the best run', () => {
    const entries = {
      '2026-08-14': ['a'],
      '2026-08-15': ['b'], // tomorrow, should not exist yet from today's view
    }
    expect(bestStreak(entries, '2026-08-14')).toBe(1)
  })
})

describe('sameDateLastYear', () => {
  it('steps back exactly one year on the same month and day', () => {
    expect(sameDateLastYear('2026-08-14')).toBe('2025-08-14')
  })

  it('handles a leap day by naming the date, even if it never occurred', () => {
    // 2025 was not a leap year - the lookup key just won't match any real
    // entry, which is the correct behaviour rather than a crash.
    expect(sameDateLastYear('2024-02-29')).toBe('2023-02-29')
  })
})

describe('promptForDate', () => {
  it('is deterministic for the same date', () => {
    expect(promptForDate('2026-08-14')).toBe(promptForDate('2026-08-14'))
  })

  it('always returns a non-empty string', () => {
    for (const date of ['2026-01-01', '2026-06-15', '2026-12-31', '2000-01-01']) {
      expect(typeof promptForDate(date)).toBe('string')
      expect(promptForDate(date).length).toBeGreaterThan(0)
    }
  })
})
