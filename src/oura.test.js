import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

const invocations = []
const invokeResult = { current: { data: { ok: true }, error: null } }

vi.mock('./supabase.js', () => ({
  supabase: {
    functions: {
      invoke: async (name, options) => {
        invocations.push({ name, options })
        return invokeResult.current
      },
    },
  },
}))

const { startOuraConnect, consumeOuraCallback, fetchOuraData, disconnectOura } = await import('./oura.js')

function setUrl(pathAndQuery) {
  window.history.pushState({}, '', new URL(pathAndQuery, window.location.origin))
}

beforeEach(() => {
  invocations.length = 0
  invokeResult.current = { data: { ok: true }, error: null }
  sessionStorage.clear()
  setUrl('/lifestyle-app/')
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('startOuraConnect', () => {
  it('stores a fresh state and sends the browser to Oura with it attached', () => {
    const originalLocation = window.location
    delete window.location
    window.location = { ...originalLocation, href: originalLocation.href }

    startOuraConnect()

    const storedState = sessionStorage.getItem('lifestyle-app.ouraState')
    expect(storedState).toBeTruthy()

    const redirectUrl = new URL(window.location.href)
    expect(redirectUrl.origin + redirectUrl.pathname).toBe('https://cloud.ouraring.com/oauth/authorize')
    expect(redirectUrl.searchParams.get('state')).toBe(storedState)
    expect(redirectUrl.searchParams.get('response_type')).toBe('code')
    expect(redirectUrl.searchParams.get('client_id')).toBeTruthy()

    window.location = originalLocation
  })
})

describe('consumeOuraCallback', () => {
  it('does nothing when the URL carries no Oura params', async () => {
    setUrl('/lifestyle-app/')
    const result = await consumeOuraCallback()
    expect(result).toBeNull()
    expect(invocations).toHaveLength(0)
  })

  it('reports an error Oura sent back, and strips it from the URL', async () => {
    setUrl('/lifestyle-app/?error=access_denied')
    const result = await consumeOuraCallback()
    expect(result).toEqual({ ok: false, message: 'Oura declined: access_denied' })
    expect(window.location.search).toBe('')
  })

  it('rejects a callback whose state does not match what was stored', async () => {
    sessionStorage.setItem('lifestyle-app.ouraState', 'expected-state')
    setUrl('/lifestyle-app/?code=abc123&state=wrong-state')
    const result = await consumeOuraCallback()
    expect(result.ok).toBe(false)
    expect(result.message).toMatch(/tampered/)
    expect(invocations).toHaveLength(0)
    // The one-time state should be consumed either way.
    expect(sessionStorage.getItem('lifestyle-app.ouraState')).toBeNull()
  })

  it('rejects a callback when no state was ever stored', async () => {
    setUrl('/lifestyle-app/?code=abc123&state=whatever')
    const result = await consumeOuraCallback()
    expect(result.ok).toBe(false)
  })

  it('exchanges a valid code for tokens via the Edge Function', async () => {
    sessionStorage.setItem('lifestyle-app.ouraState', 'good-state')
    setUrl('/lifestyle-app/?code=abc123&state=good-state')
    invokeResult.current = { data: { ok: true }, error: null }

    const result = await consumeOuraCallback()

    expect(result).toEqual({ ok: true })
    expect(invocations).toEqual([{ name: 'oura', options: { body: { action: 'exchange', code: 'abc123' } } }])
    expect(window.location.search).toBe('')
  })

  it('surfaces an error returned by the Edge Function', async () => {
    sessionStorage.setItem('lifestyle-app.ouraState', 'good-state')
    setUrl('/lifestyle-app/?code=abc123&state=good-state')
    invokeResult.current = { data: { error: 'Oura token exchange failed' }, error: null }

    const result = await consumeOuraCallback()

    expect(result).toEqual({ ok: false, message: 'Oura token exchange failed' })
  })

  it('surfaces a network-level invoke error', async () => {
    sessionStorage.setItem('lifestyle-app.ouraState', 'good-state')
    setUrl('/lifestyle-app/?code=abc123&state=good-state')
    invokeResult.current = { data: null, error: { message: 'Failed to fetch' } }

    const result = await consumeOuraCallback()

    expect(result).toEqual({ ok: false, message: 'Failed to fetch' })
  })

  it('digs the real message out of a non-2xx response instead of the generic one', async () => {
    sessionStorage.setItem('lifestyle-app.ouraState', 'good-state')
    setUrl('/lifestyle-app/?code=abc123&state=good-state')
    invokeResult.current = {
      data: null,
      error: {
        message: 'Edge Function returned a non-2xx status code',
        context: { json: async () => ({ error: 'Oura token exchange failed: 400 invalid_grant' }) },
      },
    }

    const result = await consumeOuraCallback()

    expect(result).toEqual({ ok: false, message: 'Oura token exchange failed: 400 invalid_grant' })
  })
})

describe('fetchOuraData', () => {
  it('returns the parsed payload on success', async () => {
    invokeResult.current = { data: { connected: true, sleep: [], activity: [] }, error: null }
    const result = await fetchOuraData()
    expect(result).toEqual({ connected: true, sleep: [], activity: [] })
    expect(invocations).toEqual([{ name: 'oura', options: { body: { action: 'fetch' } } }])
  })

  it('throws when the Edge Function reports an error', async () => {
    invokeResult.current = { data: { error: 'Not signed in.' }, error: null }
    await expect(fetchOuraData()).rejects.toThrow('Not signed in.')
  })

  it('throws when the invoke call itself fails', async () => {
    invokeResult.current = { data: null, error: { message: 'network down' } }
    await expect(fetchOuraData()).rejects.toThrow('network down')
  })
})

describe('disconnectOura', () => {
  it('asks the Edge Function to drop stored tokens', async () => {
    invokeResult.current = { data: { ok: true }, error: null }
    const result = await disconnectOura()
    expect(result).toEqual({ ok: true })
    expect(invocations).toEqual([{ name: 'oura', options: { body: { action: 'disconnect' } } }])
  })

  it('throws when the Edge Function reports an error', async () => {
    invokeResult.current = { data: { error: 'Not signed in.' }, error: null }
    await expect(disconnectOura()).rejects.toThrow('Not signed in.')
  })
})
