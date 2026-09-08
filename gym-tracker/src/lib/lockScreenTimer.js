import { getAudioContext } from './sound.js'

// Best-effort lock-screen visibility for the rest timer via the Media
// Session API — a web page has no way to draw on the lock screen directly,
// but browsers that support Media Session will show `metadata` (title/
// artist) on the lock-screen media widget while something is "playing".
// That "playing" state has to be real: a near-silent (not literally zero
// gain, which some browsers' background-audio heuristics ignore) looping
// tone through an actual <audio> element, built once and reused across
// rest periods rather than recreated each time.
//
// Support varies a lot by device/OS (solid on Android Chrome, inconsistent
// on iOS Safari) — this degrades to a silent no-op everywhere it isn't
// supported, and is never the only way to see the timer (the in-app pill
// and completion chime/vibration still work regardless).
let audioEl = null

function isSupported() {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator && typeof MediaMetadata !== 'undefined'
}

function ensureAudioElement() {
  if (audioEl) return audioEl
  const ctx = getAudioContext()
  if (!ctx || typeof ctx.createMediaStreamDestination !== 'function') return null
  const destination = ctx.createMediaStreamDestination()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  gain.gain.value = 0.001
  oscillator.frequency.value = 30
  oscillator.connect(gain)
  gain.connect(destination)
  oscillator.start()
  audioEl = new Audio()
  audioEl.srcObject = destination.stream
  audioEl.loop = true
  return audioEl
}

export function startLockScreenTimer(label) {
  try {
    if (!isSupported()) return
    const el = ensureAudioElement()
    if (!el) return
    el.play().catch(() => {})
    navigator.mediaSession.metadata = new MediaMetadata({ title: label, artist: 'Gym Tracker', album: 'Rest Timer' })
    navigator.mediaSession.playbackState = 'playing'
    // The lock-screen widget offers play/pause controls by default; a
    // tap on either shouldn't actually pause the countdown, so both just
    // reassert "playing" instead of leaving the widget in a paused state
    // the countdown has no way to resume from without reopening the app.
    navigator.mediaSession.setActionHandler('play', () => {
      el.play().catch(() => {})
      navigator.mediaSession.playbackState = 'playing'
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      navigator.mediaSession.playbackState = 'playing'
    })
  } catch {
    // Best-effort only — never let this break the actual rest timer.
  }
}

export function updateLockScreenTimer(label) {
  try {
    if (!isSupported() || !navigator.mediaSession.metadata) return
    navigator.mediaSession.metadata = new MediaMetadata({ title: label, artist: 'Gym Tracker', album: 'Rest Timer' })
  } catch {
    // Best-effort only.
  }
}

export function stopLockScreenTimer() {
  try {
    if (!isSupported()) return
    audioEl?.pause()
    navigator.mediaSession.metadata = null
    navigator.mediaSession.playbackState = 'none'
    navigator.mediaSession.setActionHandler('play', null)
    navigator.mediaSession.setActionHandler('pause', null)
  } catch {
    // Best-effort only.
  }
}
