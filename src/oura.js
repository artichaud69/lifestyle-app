import { invokeEdge } from './edgeFunction.js'

// Client IDs are safe to ship in the bundle, same reasoning as the Supabase
// publishable key: they only identify the app, they don't authorize anything
// by themselves. The client secret lives only in the Edge Function.
const OURA_CLIENT_ID = '635d8a1b-c3c7-430b-947a-91c458136a28'
const OURA_AUTHORIZE_URL = 'https://cloud.ouraring.com/oauth/authorize'
const STATE_KEY = 'lifestyle-app.ouraState'

function redirectUri() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}

export function startOuraConnect() {
  const state = crypto.randomUUID()
  sessionStorage.setItem(STATE_KEY, state)
  const params = new URLSearchParams({
    client_id: OURA_CLIENT_ID,
    redirect_uri: redirectUri(),
    response_type: 'code',
    scope: 'daily',
    state,
  })
  window.location.href = `${OURA_AUTHORIZE_URL}?${params.toString()}`
}

// Called once on app startup. If Oura just redirected back with a code (or an
// error), exchanges it for tokens and strips the params so a page refresh
// can't replay the exchange. Returns null when there was nothing to handle.
export async function consumeOuraCallback() {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')

  if (!code && !error) return null

  url.searchParams.delete('code')
  url.searchParams.delete('state')
  url.searchParams.delete('error')
  window.history.replaceState({}, '', url.toString())

  if (error) return { ok: false, message: `Oura declined: ${error}` }

  const expectedState = sessionStorage.getItem(STATE_KEY)
  sessionStorage.removeItem(STATE_KEY)
  if (!state || state !== expectedState) {
    return { ok: false, message: 'That authorization link looked tampered with, so it was ignored.' }
  }

  try {
    await invokeEdge('oura', { action: 'exchange', code })
    return { ok: true }
  } catch (error) {
    return { ok: false, message: error.message }
  }
}

export function fetchOuraData() {
  return invokeEdge('oura', { action: 'fetch' })
}

export function disconnectOura() {
  return invokeEdge('oura', { action: 'disconnect' })
}
