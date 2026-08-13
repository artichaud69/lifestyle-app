import { describe, it, expect, beforeEach } from 'vitest'
import { loadJournal, saveJournal, MOODS } from './journal.js'

const KEY = 'lifestyle-app.journal'

beforeEach(() => {
  localStorage.clear()
})

describe('MOODS', () => {
  it('covers levels 1 to 5 in order, each with a label', () => {
    expect(MOODS.map((mood) => mood.value)).toEqual([1, 2, 3, 4, 5])
    expect(MOODS.every((mood) => typeof mood.label === 'string' && mood.label)).toBe(true)
  })
})

describe('loadJournal', () => {
  it('returns an empty object when nothing was saved', () => {
    expect(loadJournal()).toEqual({})
  })

  it('returns an empty object rather than throwing on corrupt data', () => {
    localStorage.setItem(KEY, 'nonsense{')
    expect(loadJournal()).toEqual({})
  })

  it('round-trips entries', () => {
    const entries = { '2026-08-12': { mood: 4, note: 'good day' } }
    saveJournal(entries)
    expect(loadJournal()).toEqual(entries)
  })

  it('upgrades bare mood numbers saved before notes existed', () => {
    localStorage.setItem(KEY, JSON.stringify({ '2026-08-11': 3 }))
    expect(loadJournal()).toEqual({ '2026-08-11': { mood: 3, note: '' } })
  })

  it('migrates old and new entries side by side', () => {
    localStorage.setItem(
      KEY,
      JSON.stringify({ '2026-08-10': 2, '2026-08-11': { mood: 5, note: 'kept' } }),
    )
    expect(loadJournal()).toEqual({
      '2026-08-10': { mood: 2, note: '' },
      '2026-08-11': { mood: 5, note: 'kept' },
    })
  })
})
