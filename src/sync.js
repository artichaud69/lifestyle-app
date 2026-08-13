import { supabase } from './supabase.js'
import { onDataChanged } from './dataChange.js'

// Only user-generated data syncs. The Anthropic API key deliberately stays on
// the device it was typed into and is never uploaded.
const SYNCED_KEYS = {
  habits: 'lifestyle-app.habits',
  journal: 'lifestyle-app.journal',
  goals: 'lifestyle-app.goals',
}

const LOCAL_UPDATED_AT_KEY = 'lifestyle-app.updatedAt'
const RELOAD_GUARD_KEY = 'lifestyle-app.justPulled'
const PUSH_DEBOUNCE_MS = 2000

function readLocalUpdatedAt() {
  return localStorage.getItem(LOCAL_UPDATED_AT_KEY) ?? ''
}

export function stampLocalChange() {
  localStorage.setItem(LOCAL_UPDATED_AT_KEY, new Date().toISOString())
}

function snapshot() {
  const data = {}
  for (const [name, key] of Object.entries(SYNCED_KEYS)) {
    const raw = localStorage.getItem(key)
    if (raw === null) continue
    try {
      data[name] = JSON.parse(raw)
    } catch {
      // skip anything unparseable rather than uploading corrupt values
    }
  }
  return data
}

function restore(data) {
  for (const [name, key] of Object.entries(SYNCED_KEYS)) {
    if (data?.[name] === undefined) continue
    localStorage.setItem(key, JSON.stringify(data[name]))
  }
}

async function fetchRemote(userId) {
  const { data, error } = await supabase
    .from('app_data')
    .select('data, updated_at')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function pushNow(userId) {
  const updatedAt = readLocalUpdatedAt() || new Date().toISOString()
  const { error } = await supabase
    .from('app_data')
    .upsert({ user_id: userId, data: snapshot(), updated_at: updatedAt })
  if (error) throw error
  localStorage.setItem(LOCAL_UPDATED_AT_KEY, updatedAt)
  return updatedAt
}

// Decides, on startup or right after signing in, whether this device should
// adopt what the server has or overwrite it with what is on the device.
export async function reconcile(userId) {
  const remote = await fetchRemote(userId)

  if (!remote) {
    // nothing stored yet for this account - this device seeds it
    const at = await pushNow(userId)
    return { action: 'pushed', at }
  }

  const localAt = readLocalUpdatedAt()
  if (remote.updated_at > localAt) {
    restore(remote.data)
    localStorage.setItem(LOCAL_UPDATED_AT_KEY, remote.updated_at)
    // React state was built from the old localStorage contents, so the cheapest
    // correct way to show the adopted data is a single reload.
    if (!sessionStorage.getItem(RELOAD_GUARD_KEY)) {
      sessionStorage.setItem(RELOAD_GUARD_KEY, '1')
      window.location.reload()
    }
    return { action: 'pulled', at: remote.updated_at }
  }

  const at = await pushNow(userId)
  return { action: 'pushed', at }
}

// Pushes local changes up, coalescing bursts of edits into one request.
export function startAutoPush(userId, { onStateChange } = {}) {
  let timer = null
  let pending = false

  async function flush() {
    if (!pending) return
    pending = false
    onStateChange?.({ status: 'syncing' })
    try {
      const at = await pushNow(userId)
      onStateChange?.({ status: 'synced', at })
    } catch (error) {
      pending = true
      onStateChange?.({ status: 'error', message: error.message })
    }
  }

  const unsubscribe = onDataChanged(() => {
    stampLocalChange()
    pending = true
    onStateChange?.({ status: 'pending' })
    clearTimeout(timer)
    timer = setTimeout(flush, PUSH_DEBOUNCE_MS)
  })

  // Mobile browsers often freeze a backgrounded tab before a pending timer
  // fires, so flush on the way out too.
  function handleVisibility() {
    if (document.visibilityState === 'hidden') {
      clearTimeout(timer)
      flush()
    }
  }
  document.addEventListener('visibilitychange', handleVisibility)

  return () => {
    unsubscribe()
    clearTimeout(timer)
    document.removeEventListener('visibilitychange', handleVisibility)
  }
}

export function lastSyncedAt() {
  return readLocalUpdatedAt()
}
