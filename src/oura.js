import { supabase } from './supabase.js'

// Client IDs are safe to ship in the bundle, same reasoning as the Supabase
// publishable key: they only identify the app, they don't authorize anything
// by themselves. The client secret lives only in the Edge Function.
const OURA_CLIENT_ID = '635d8a1b-c3c7-430b-947a-91c458136a28'
const OURA_AUTHORIZE_URL = 'https://cloud.ouraring.com/oauth/authorize'
const STATE_KEY = 'lifestyle-app.ouraState'

function redirectUri() {
  return `${window.location.origin}${import.meta.env.BASE_URL}`
}

// supabase-js's invoke() error.message is always the same generic string on
// any non-2xx response ("Edge Function returned a non-2xx status code") - the
// function's actual error body is only reachable via error.context, the raw
// Response. This digs out that real message so failures are debuggable.
async function describeInvokeError(error) {
  const body = await error.context?.json?.().catch(() => null)
  return body?.error ?? error.message
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

  const { data, error: invokeError } = await supabase.functions.invoke('oura', {
    body: { action: 'exchange', code },
  })
  if (invokeError) return { ok: false, message: await describeInvokeError(invokeError) }
  if (data?.error) return { ok: false, message: data.error }
  return { ok: true }
}

export async function fetchOuraData() {
  const { data, error } = await supabase.functions.invoke('oura', { body: { action: 'fetch' } })
  if (error) throw new Error(await describeInvokeError(error))
  if (data?.error) throw new Error(data.error)
  return data
}

export async function disconnectOura() {
  const { data, error } = await supabase.functions.invoke('oura', { body: { action: 'disconnect' } })
  if (error) throw new Error(await describeInvokeError(error))
  if (data?.error) throw new Error(data.error)
  return data
}
