import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// Stand in for the network so the reconcile decisions can be exercised directly.
const remoteRow = { current: null }
const upserts = []

vi.mock('./supabase.js', () => ({
  redirectUrl: () => 'http://localhost/',
  supabase: {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: remoteRow.current, error: null }),
        }),
      }),
      upsert: async (row) => {
        upserts.push(row)
        return { error: null }
      },
    }),
  },
}))

const { isNewer, reconcile, pushNow, stampLocalChange, lastSyncedAt } = await import('./sync.js')

const USER = 'user-1'
const HABITS_KEY = 'lifestyle-app.habits'
const JOURNAL_KEY = 'lifestyle-app.journal'
const GOALS_KEY = 'lifestyle-app.goals'
const STAMP_KEY = 'lifestyle-app.updatedAt'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  remoteRow.current = null
  upserts.length = 0
})

afterEach(() => {
  vi.useRealTimers()
})

// This comparison decides whether a device adopts the server's copy or
// overwrites it, so a wrong answer here silently destroys history.
describe('isNewer', () => {
  it('compares instants, not raw strings', () => {
    // Postgres returns "+00:00" while the app writes "Z"; the same instant
    // must not look newer in either direction.
    expect(isNewer('2026-08-13T23:00:00+00:00', '2026-08-13T23:00:00.000Z')).toBe(false)
    expect(isNewer('2026-08-13T23:00:00.000Z', '2026-08-13T23:00:00+00:00')).toBe(false)
  })

  it('is not fooled by a non-UTC offset', () => {
    // 01:00+02:00 is 23:00 UTC, which is older than 23:30 UTC even though
    // it sorts later as text.
    expect(isNewer('2026-08-14T01:00:00+02:00', '2026-08-13T23:30:00.000Z')).toBe(false)
    // 22:00-02:00 is 00:00 UTC the next day, so it is genuinely newer.
    expect(isNewer('2026-08-13T22:00:00-02:00', '2026-08-13T23:30:00.000Z')).toBe(true)
  })

  it('handles ordinary newer and older cases', () => {
    expect(isNewer('2026-08-13T23:00:00+00:00', '2026-08-13T10:00:00.000Z')).toBe(true)
    expect(isNewer('2026-08-13T10:00:00+00:00', '2026-08-13T23:00:00.000Z')).toBe(false)
  })

  it('treats a device that has never synced as older than any server copy', () => {
    expect(isNewer('2026-08-13T23:00:00+00:00', '')).toBe(true)
  })

  it('never claims an unparseable timestamp is newer', () => {
    expect(isNewer('not-a-date', '2026-08-13T23:00:00.000Z')).toBe(false)
  })
})

describe('pushNow', () => {
  it('uploads every synced store', async () => {
    localStorage.setItem(HABITS_KEY, JSON.stringify([{ id: 'h1' }]))
    localStorage.setItem(JOURNAL_KEY, JSON.stringify({ '2026-08-12': { mood: 4, note: '' } }))
    localStorage.setItem(GOALS_KEY, JSON.stringify([{ id: 'g1' }]))

    await pushNow(USER)

    expect(upserts).toHaveLength(1)
    expect(upserts[0].data).toEqual({
      habits: [{ id: 'h1' }],
      journal: { '2026-08-12': { mood: 4, note: '' } },
      goals: [{ id: 'g1' }],
    })
  })

  it('never uploads the API key', async () => {
    localStorage.setItem('lifestyle-app.anthropicApiKey', 'sk-ant-secret')
    localStorage.setItem(HABITS_KEY, JSON.stringify([{ id: 'h1' }]))

    await pushNow(USER)

    expect(JSON.stringify(upserts)).not.toContain('sk-ant-secret')
  })

  it('skips a store that holds unparseable data instead of uploading garbage', async () => {
    localStorage.setItem(HABITS_KEY, JSON.stringify([{ id: 'h1' }]))
    localStorage.setItem(JOURNAL_KEY, 'corrupt{')

    await pushNow(USER)

    expect(upserts[0].data.habits).toEqual([{ id: 'h1' }])
    expect(upserts[0].data).not.toHaveProperty('journal')
  })

  it('records when the device last synced', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-13T22:00:00.000Z'))
    await pushNow(USER)
    expect(lastSyncedAt()).toBe('2026-08-13T22:00:00.000Z')
  })
})

describe('reconcile', () => {
  it('seeds the server from this device when nothing is stored yet', async () => {
    localStorage.setItem(HABITS_KEY, JSON.stringify([{ id: 'local-only' }]))

    const result = await reconcile(USER)

    expect(result.action).toBe('pushed')
    expect(upserts[0].data.habits).toEqual([{ id: 'local-only' }])
    // local data must survive the first sync
    expect(JSON.parse(localStorage.getItem(HABITS_KEY))).toEqual([{ id: 'local-only' }])
  })

  it('adopts the server copy when it is newer', async () => {
    localStorage.setItem(HABITS_KEY, JSON.stringify([{ id: 'stale' }]))
    localStorage.setItem(STAMP_KEY, '2026-08-13T10:00:00.000Z')
    remoteRow.current = {
      updated_at: '2026-08-13T23:00:00+00:00',
      data: { habits: [{ id: 'fresh' }], journal: { '2026-08-12': { mood: 5, note: 'server' } } },
    }

    const result = await reconcile(USER)

    expect(result.action).toBe('pulled')
    expect(JSON.parse(localStorage.getItem(HABITS_KEY))).toEqual([{ id: 'fresh' }])
    expect(JSON.parse(localStorage.getItem(JOURNAL_KEY))).toEqual({
      '2026-08-12': { mood: 5, note: 'server' },
    })
    expect(lastSyncedAt()).toBe('2026-08-13T23:00:00+00:00')
    expect(upserts).toHaveLength(0)
  })

  it('overwrites the server when this device is newer', async () => {
    localStorage.setItem(HABITS_KEY, JSON.stringify([{ id: 'fresh-local' }]))
    localStorage.setItem(STAMP_KEY, '2026-08-13T23:00:00.000Z')
    remoteRow.current = {
      updated_at: '2026-08-10T00:00:00+00:00',
      data: { habits: [{ id: 'old-remote' }] },
    }

    const result = await reconcile(USER)

    expect(result.action).toBe('pushed')
    expect(JSON.parse(localStorage.getItem(HABITS_KEY))).toEqual([{ id: 'fresh-local' }])
    expect(upserts[0].data.habits).toEqual([{ id: 'fresh-local' }])
  })

  it('does not pull when the two sides describe the same instant', async () => {
    localStorage.setItem(HABITS_KEY, JSON.stringify([{ id: 'local' }]))
    localStorage.setItem(STAMP_KEY, '2026-08-13T23:00:00.000Z')
    remoteRow.current = {
      updated_at: '2026-08-13T23:00:00+00:00',
      data: { habits: [{ id: 'remote' }] },
    }

    const result = await reconcile(USER)

    expect(result.action).toBe('pushed')
    expect(JSON.parse(localStorage.getItem(HABITS_KEY))).toEqual([{ id: 'local' }])
  })

  it('leaves stores the server does not know about untouched', async () => {
    localStorage.setItem(GOALS_KEY, JSON.stringify([{ id: 'local-goal' }]))
    localStorage.setItem(STAMP_KEY, '2026-08-13T10:00:00.000Z')
    remoteRow.current = {
      updated_at: '2026-08-13T23:00:00+00:00',
      data: { habits: [{ id: 'fresh' }] }, // no goals key at all
    }

    await reconcile(USER)

    expect(JSON.parse(localStorage.getItem(GOALS_KEY))).toEqual([{ id: 'local-goal' }])
  })
})

describe('stampLocalChange', () => {
  it('marks the device as changed more recently than the last sync', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-08-13T22:00:00.000Z'))
    await pushNow(USER)
    const synced = lastSyncedAt()

    vi.setSystemTime(new Date('2026-08-13T22:05:00.000Z'))
    stampLocalChange()

    expect(isNewer(lastSyncedAt(), synced)).toBe(true)
  })
})
