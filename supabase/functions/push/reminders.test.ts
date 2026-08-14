import { describe, it, expect } from 'vitest'
import { localParts, startOfWeek, habitsStillDue, reminderBody, shouldSend } from './reminders.ts'

describe('localParts', () => {
  it('reports the hour where the subscriber is, not UTC', () => {
    // 19:30 UTC is 21:30 in Paris during summer time.
    const now = new Date('2026-08-14T19:30:00Z')
    expect(localParts('Europe/Paris', now)).toEqual({ date: '2026-08-14', hour: 21 })
    expect(localParts('UTC', now)).toEqual({ date: '2026-08-14', hour: 19 })
  })

  it('follows daylight saving rather than a fixed offset', () => {
    const summer = new Date('2026-08-14T19:30:00Z')
    const winter = new Date('2026-01-14T19:30:00Z')
    expect(localParts('Europe/Paris', summer).hour).toBe(21)
    expect(localParts('Europe/Paris', winter).hour).toBe(20)
  })

  it('rolls the local date over before UTC does', () => {
    // Still the 14th in UTC, already the 15th in Tokyo.
    const now = new Date('2026-08-14T23:00:00Z')
    expect(localParts('UTC', now).date).toBe('2026-08-14')
    expect(localParts('Asia/Tokyo', now).date).toBe('2026-08-15')
  })

  it('reports midnight as hour 0, never 24', () => {
    const now = new Date('2026-08-14T22:10:00Z') // midnight in Paris
    expect(localParts('Europe/Paris', now).hour).toBe(0)
  })

  it('handles timezones behind UTC', () => {
    const now = new Date('2026-08-15T01:00:00Z')
    expect(localParts('America/New_York', now)).toEqual({ date: '2026-08-14', hour: 21 })
  })
})

describe('startOfWeek', () => {
  it('treats Monday as the first day', () => {
    // 2026-08-14 is a Friday.
    expect(startOfWeek('2026-08-14')).toBe('2026-08-10')
  })

  it('leaves a Monday where it is', () => {
    expect(startOfWeek('2026-08-10')).toBe('2026-08-10')
  })

  it('puts Sunday at the end of the week it closes, not the start of the next', () => {
    expect(startOfWeek('2026-08-16')).toBe('2026-08-10')
    expect(startOfWeek('2026-08-17')).toBe('2026-08-17')
  })

  it('walks back across a month boundary', () => {
    expect(startOfWeek('2026-09-01')).toBe('2026-08-31')
  })
})

describe('habitsStillDue', () => {
  const today = '2026-08-14' // Friday, week starts 2026-08-10

  it('skips a habit already ticked today', () => {
    const habits = [{ name: 'Meditate', timesPerWeek: 7, doneDates: [today] }]
    expect(habitsStillDue(habits, today)).toEqual([])
  })

  it('includes a daily habit not yet ticked today', () => {
    const habits = [{ name: 'Meditate', timesPerWeek: 7, doneDates: ['2026-08-13'] }]
    expect(habitsStillDue(habits, today).map((h) => h.name)).toEqual(['Meditate'])
  })

  it('goes quiet once a weekly target is already met', () => {
    const habits = [
      { name: 'No sugar', timesPerWeek: 3, doneDates: ['2026-08-10', '2026-08-11', '2026-08-12'] },
    ]
    expect(habitsStillDue(habits, today)).toEqual([])
  })

  it('still nudges when the weekly target is short', () => {
    const habits = [{ name: 'No sugar', timesPerWeek: 3, doneDates: ['2026-08-10', '2026-08-11'] }]
    expect(habitsStillDue(habits, today).map((h) => h.name)).toEqual(['No sugar'])
  })

  it('does not count last week towards this week s target', () => {
    const habits = [
      { name: 'No sugar', timesPerWeek: 3, doneDates: ['2026-08-03', '2026-08-04', '2026-08-05'] },
    ]
    expect(habitsStillDue(habits, today).map((h) => h.name)).toEqual(['No sugar'])
  })

  it('treats a habit with no frequency set as daily', () => {
    const habits = [{ name: 'Read', doneDates: [] }]
    expect(habitsStillDue(habits, today).map((h) => h.name)).toEqual(['Read'])
  })

  it('copes with missing or empty data', () => {
    expect(habitsStillDue([], today)).toEqual([])
    expect(habitsStillDue(undefined as any, today)).toEqual([])
    expect(habitsStillDue([{ name: 'Read' }], today).map((h) => h.name)).toEqual(['Read'])
  })
})

describe('reminderBody', () => {
  it('names a single habit', () => {
    expect(reminderBody([{ name: 'Read' }])).toBe('Read is still open today.')
  })

  it('names both when there are two', () => {
    expect(reminderBody([{ name: 'Read' }, { name: 'Meditate' }])).toBe(
      'Read and Meditate are still open today.',
    )
  })

  it('summarises rather than listing everything', () => {
    const body = reminderBody([{ name: 'Read' }, { name: 'Meditate' }, { name: 'No sugar' }])
    expect(body).toBe('3 habits still open, including Read and Meditate.')
  })
})

describe('shouldSend', () => {
  it('waits for the subscriber s chosen hour', () => {
    expect(shouldSend({ reminder_hour: 20 }, { date: '2026-08-14', hour: 19 })).toBe(false)
    expect(shouldSend({ reminder_hour: 20 }, { date: '2026-08-14', hour: 20 })).toBe(true)
  })

  it('does not send twice on the same local day', () => {
    expect(shouldSend({ reminder_hour: 20, last_sent_on: '2026-08-14' }, { date: '2026-08-14', hour: 20 })).toBe(
      false,
    )
  })

  it('sends again the next day', () => {
    expect(shouldSend({ reminder_hour: 20, last_sent_on: '2026-08-13' }, { date: '2026-08-14', hour: 20 })).toBe(
      true,
    )
  })
})
