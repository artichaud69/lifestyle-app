// Answers the question that decides whether rest alerts need a server:
// does a notification the app scheduled still fire once the phone is locked?
//
// iOS suspends a backgrounded web app, but not always instantly — if there's
// a grace period long enough to cover a rest, alerts work with no backend at
// all. If there isn't, only a pushed notification can wake the app and that
// means building one.
//
// Rather than rely on noticing buzzes, each scheduled alert records the
// moment it actually fired. A suspended app's timer doesn't vanish, it fires
// late — on resume — so "fired" alone proves nothing. Lateness is the signal:
// on time means it ran while locked, tens of seconds late means it sat frozen
// until the phone was picked up.
const TEST_KEY = 'gym-tracker.lockedAlertTest'
const ON_TIME_TOLERANCE_MS = 3000

function load() {
  try {
    const raw = localStorage.getItem(TEST_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function save(state) {
  try {
    localStorage.setItem(TEST_KEY, JSON.stringify(state))
  } catch {
    // Nothing to do — the test just won't have results to show.
  }
}

async function fire(seconds) {
  const state = load()
  if (state) {
    const entry = state.entries.find((e) => e.seconds === seconds)
    if (entry && entry.firedAt === null) {
      entry.firedAt = Date.now()
      save(state)
    }
  }
  try {
    const registration = await navigator.serviceWorker.ready
    // iOS has no Notification constructor; notifications come from the
    // service worker registration, same as a pushed one would.
    await registration.showNotification(`Rest alert test — ${seconds}s`, {
      body: 'Scheduled while the app was open.',
      tag: `gym-tracker-test-${seconds}`,
    })
  } catch {
    // The recorded fire time is the real result; the visible notification is
    // just what makes it obvious on the wrist.
  }
}

export function startLockedAlertTest(delays = [5, 30, 60, 120]) {
  const startedAt = Date.now()
  const state = {
    startedAt,
    entries: delays.map((seconds) => ({ seconds, dueAt: startedAt + seconds * 1000, firedAt: null })),
  }
  save(state)
  for (const seconds of delays) {
    setTimeout(() => fire(seconds), seconds * 1000)
  }
  return state
}

export function getLockedAlertResults() {
  const state = load()
  if (!state) return null
  const now = Date.now()
  return {
    startedAt: state.startedAt,
    entries: state.entries.map((entry) => {
      const lateBy = entry.firedAt === null ? null : entry.firedAt - entry.dueAt
      return {
        seconds: entry.seconds,
        fired: entry.firedAt !== null,
        lateBy,
        onTime: lateBy !== null && lateBy <= ON_TIME_TOLERANCE_MS,
        stillPending: entry.firedAt === null && now < entry.dueAt,
      }
    }),
  }
}

export function clearLockedAlertTest() {
  try {
    localStorage.removeItem(TEST_KEY)
  } catch {
    // Nothing to do.
  }
}
