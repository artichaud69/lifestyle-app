import { describe, it, expect } from 'vitest'
import { sortByDate, latestEntry, changeSincePrevious } from './bodyweight.js'

function entry(date, weight) {
  return { id: date, date, weight }
}

describe('sortByDate', () => {
  it('sorts oldest to newest regardless of input order', () => {
    const entries = [entry('2026-01-15', 80), entry('2026-01-01', 82), entry('2026-01-08', 81)]
    expect(sortByDate(entries).map((e) => e.date)).toEqual(['2026-01-01', '2026-01-08', '2026-01-15'])
  })
})

describe('latestEntry', () => {
  it('returns the most recent entry', () => {
    const entries = [entry('2026-01-01', 82), entry('2026-01-15', 80)]
    expect(latestEntry(entries).weight).toBe(80)
  })

  it('returns null for an empty list', () => {
    expect(latestEntry([])).toBeNull()
  })
})

describe('changeSincePrevious', () => {
  it('returns null with fewer than two entries', () => {
    expect(changeSincePrevious([])).toBeNull()
    expect(changeSincePrevious([entry('2026-01-01', 80)])).toBeNull()
  })

  it('returns the delta between the latest entry and the one before it', () => {
    const entries = [entry('2026-01-01', 82), entry('2026-01-08', 81), entry('2026-01-15', 81.5)]
    expect(changeSincePrevious(entries)).toBeCloseTo(0.5)
  })

  it('is unaffected by input order', () => {
    const entries = [entry('2026-01-15', 81.5), entry('2026-01-01', 82), entry('2026-01-08', 81)]
    expect(changeSincePrevious(entries)).toBeCloseTo(0.5)
  })
})
