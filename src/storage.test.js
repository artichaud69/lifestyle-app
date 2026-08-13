import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { loadHabits, saveHabits } from './storage.js'
import { DAILY } from './frequency.js'

const TODAY = new Date(2026, 7, 13, 12, 0, 0)
const KEY = 'lifestyle-app.habits'

function seed(value) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(TODAY)
  localStorage.clear()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('loadHabits', () => {
  it('returns null when nothing was ever saved', () => {
    expect(loadHabits()).toBeNull()
  })

  it('returns null rather than throwing on corrupt data', () => {
    localStorage.setItem(KEY, '{not json')
    expect(loadHabits()).toBeNull()
  })

  it('round-trips a current-shape habit unchanged', () => {
    const habit = {
      id: 'a1',
      name: 'Meditate',
      startDate: '2026-08-01',
      timesPerWeek: 3,
      doneDates: ['2026-08-02'],
    }
    saveHabits([habit])
    expect(loadHabits()).toEqual([habit])
  })
})

// Every one of these shapes exists in real saved data. A habit missing
// startDate is what once crashed the app on load, so these guard the
// upgrade path rather than any new behaviour.
describe('migrating habits saved by older versions', () => {
  it('backfills startDate from the older createdAt field', () => {
    seed([{ id: 'a1', name: 'Read', createdAt: '2026-07-04', timesPerWeek: 7, doneDates: [] }])
    expect(loadHabits()[0].startDate).toBe('2026-07-04')
  })

  it('falls back to today when a habit has no date at all', () => {
    seed([{ id: 'a1', name: 'Read', timesPerWeek: 7, doneDates: [] }])
    expect(loadHabits()[0].startDate).toBe('2026-08-13')
  })

  it('converts a day-of-week schedule into a weekly target', () => {
    seed([{ id: 'a1', name: 'Gym', startDate: '2026-08-01', schedule: [1, 3, 5], doneDates: [] }])
    expect(loadHabits()[0].timesPerWeek).toBe(3)
  })

  it('treats a habit predating any frequency concept as daily', () => {
    seed([{ id: 'a1', name: 'Read', startDate: '2026-08-01', doneDates: [] }])
    expect(loadHabits()[0].timesPerWeek).toBe(DAILY)
  })

  it('migrates the oldest possible shape into something fully usable', () => {
    seed([{ id: 'a1', name: 'Ancient', createdAt: '2026-06-01', doneDates: ['2026-06-02'] }])
    const [habit] = loadHabits()
    expect(habit).toMatchObject({
      startDate: '2026-06-01',
      timesPerWeek: DAILY,
      doneDates: ['2026-06-02'],
    })
  })

  it('leaves already-migrated fields alone', () => {
    seed([
      {
        id: 'a1',
        name: 'Read',
        createdAt: '2026-01-01',
        startDate: '2026-07-04',
        schedule: [1, 2],
        timesPerWeek: 5,
        doneDates: [],
      },
    ])
    const [habit] = loadHabits()
    expect(habit.startDate).toBe('2026-07-04')
    expect(habit.timesPerWeek).toBe(5)
  })
})
