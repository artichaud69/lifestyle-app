import { describe, it, expect } from 'vitest'
import {
  addEntry,
  removeEntry,
  sortedByRecency,
  entriesInLastDays,
  groupByDay,
} from './anxiety.js'

function entry(id, at, overrides = {}) {
  return { id, at, severity: 'mild', triggers: [], note: '', ...overrides }
}

describe('addEntry', () => {
  it('prepends a new entry stamped with the current time', () => {
    const result = addEntry([], { severity: 'moderate', triggers: ['Work'], note: '  tight deadline  ' })
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ severity: 'moderate', triggers: ['Work'], note: 'tight deadline' })
    expect(typeof result[0].id).toBe('string')
    expect(Number.isNaN(Date.parse(result[0].at))).toBe(false)
  })

  it('does not mutate the existing list', () => {
    const existing = [entry('a', '2026-08-14T09:00:00.000Z')]
    const result = addEntry(existing, { severity: 'mild', triggers: [], note: '' })
    expect(existing).toHaveLength(1)
    expect(result).toHaveLength(2)
  })
})

describe('removeEntry', () => {
  it('drops the matching entry and keeps the rest', () => {
    const entries = [entry('a', '2026-08-14T09:00:00.000Z'), entry('b', '2026-08-13T09:00:00.000Z')]
    expect(removeEntry(entries, 'a')).toEqual([entries[1]])
  })

  it('is a no-op when the id is not found', () => {
    const entries = [entry('a', '2026-08-14T09:00:00.000Z')]
    expect(removeEntry(entries, 'missing')).toEqual(entries)
  })
})

describe('sortedByRecency', () => {
  it('orders newest first regardless of input order', () => {
    const entries = [
      entry('old', '2026-08-01T09:00:00.000Z'),
      entry('new', '2026-08-14T09:00:00.000Z'),
      entry('mid', '2026-08-07T09:00:00.000Z'),
    ]
    expect(sortedByRecency(entries).map((e) => e.id)).toEqual(['new', 'mid', 'old'])
  })
})

describe('entriesInLastDays', () => {
  const now = '2026-08-14T12:00:00.000Z'

  it('includes entries within the window and excludes older ones', () => {
    const entries = [
      entry('within', '2026-08-10T12:00:00.000Z'),
      entry('boundary', '2026-08-07T12:00:00.000Z'),
      entry('outside', '2026-08-06T12:00:00.000Z'),
    ]
    expect(entriesInLastDays(entries, 7, now).map((e) => e.id).sort()).toEqual(['boundary', 'within'])
  })

  it('is empty when there are no entries', () => {
    expect(entriesInLastDays([], 7, now)).toEqual([])
  })
})

describe('groupByDay', () => {
  it('buckets entries by their date and keeps each bucket newest-first', () => {
    const entries = [
      entry('a', '2026-08-14T09:00:00.000Z'),
      entry('b', '2026-08-14T18:00:00.000Z'),
      entry('c', '2026-08-13T09:00:00.000Z'),
    ]
    const groups = groupByDay(entries)
    expect(Object.keys(groups).sort()).toEqual(['2026-08-13', '2026-08-14'])
    expect(groups['2026-08-14'].map((e) => e.id)).toEqual(['b', 'a'])
  })

  it('is empty for no entries', () => {
    expect(groupByDay([])).toEqual({})
  })
})
