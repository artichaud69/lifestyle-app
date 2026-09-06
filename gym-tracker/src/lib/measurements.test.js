import { describe, it, expect } from 'vitest'
import { sortByDate, fieldHistory, latestValue, changeSincePrevious, fieldsWithData } from './measurements.js'

function entry(date, values) {
  return { id: date, date, values }
}

describe('sortByDate', () => {
  it('sorts oldest to newest regardless of input order', () => {
    const entries = [entry('2026-01-15', {}), entry('2026-01-01', {}), entry('2026-01-08', {})]
    expect(sortByDate(entries).map((e) => e.date)).toEqual(['2026-01-01', '2026-01-08', '2026-01-15'])
  })
})

describe('fieldHistory', () => {
  it('only includes entries where that field was actually measured', () => {
    const entries = [
      entry('2026-01-01', { waist: 80 }),
      entry('2026-01-08', { chest: 100 }),
      entry('2026-01-15', { waist: 79 }),
    ]
    expect(fieldHistory(entries, 'waist')).toEqual([
      { date: '2026-01-01', value: 80 },
      { date: '2026-01-15', value: 79 },
    ])
  })

  it('returns entries in date order regardless of input order', () => {
    const entries = [entry('2026-01-15', { waist: 79 }), entry('2026-01-01', { waist: 80 })]
    expect(fieldHistory(entries, 'waist').map((h) => h.date)).toEqual(['2026-01-01', '2026-01-15'])
  })

  it('returns an empty array for a field never logged', () => {
    expect(fieldHistory([entry('2026-01-01', { waist: 80 })], 'chest')).toEqual([])
  })
})

describe('latestValue', () => {
  it('returns the most recent value for that field', () => {
    const entries = [entry('2026-01-01', { waist: 80 }), entry('2026-01-15', { waist: 78 })]
    expect(latestValue(entries, 'waist')).toBe(78)
  })

  it('returns null when the field has no data', () => {
    expect(latestValue([entry('2026-01-01', { chest: 100 })], 'waist')).toBeNull()
  })
})

describe('changeSincePrevious', () => {
  it('returns null with fewer than two logged values for that field', () => {
    expect(changeSincePrevious([], 'waist')).toBeNull()
    expect(changeSincePrevious([entry('2026-01-01', { waist: 80 })], 'waist')).toBeNull()
  })

  it('returns the delta between the latest value and the one before it, skipping entries missing that field', () => {
    const entries = [
      entry('2026-01-01', { waist: 82 }),
      entry('2026-01-08', { chest: 100 }),
      entry('2026-01-15', { waist: 80 }),
    ]
    expect(changeSincePrevious(entries, 'waist')).toBeCloseTo(-2)
  })
})

describe('fieldsWithData', () => {
  it('only returns fields that have at least one logged value', () => {
    const entries = [entry('2026-01-01', { waist: 80, chest: 100 })]
    expect(fieldsWithData(entries).map((f) => f.key)).toEqual(['chest', 'waist'])
  })

  it('returns an empty array with no entries', () => {
    expect(fieldsWithData([])).toEqual([])
  })
})
