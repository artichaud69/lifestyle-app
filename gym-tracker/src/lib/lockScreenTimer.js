// Best-effort lock-screen visibility for the rest timer via the Media
// Session API — a web page can't draw on the lock screen, but browsers that
// support Media Session will show what's "playing" there.
//
// Two things make this work at all:
//
// 1. A near-silent looping WAV, generated here rather than shipped as an
//    asset (same reasoning as the chime in sound.js). It has to be a real
//    file on `src`, not a Web Audio MediaStream on `srcObject` — iOS
//    support for that is poor — and *near*-silent rather than digitally
//    silent, because browsers check whether a page is genuinely producing
//    audio before granting it a media session at all.
//
// 2. setPositionState() for the countdown itself, rather than rewriting the
//    metadata title every second. The OS renders and advances that clock
//    natively, so it stays smooth even though a locked phone clamps the
//    page's timers — per-second title rewrites visibly stutter, because the
//    throttled ticks coalesce and the OS rate-limits text repaints anyway.
//
// Support still varies by device/OS, so every entry point is feature-
// detected and safe to call anywhere; the in-app pill and the completion
// chime never depend on any of this.
const SAMPLE_RATE = 8000
// Has to stay comfortably above the ~5s below which browsers write the audio
// off as a UI sound effect and never create a media notification at all —
// that's the whole reason a lock-screen card appears or doesn't. (The first
// pass here used a 0.5s clip and nothing showed up anywhere.)
const LOOP_SECONDS = 30
const TONE_HZ = 30
// ~-42 dBFS. Not digital silence, which browsers' "is this page actually
// making noise" checks can discard, but 30Hz at this level is below what a
// phone speaker can physically reproduce.
const AMPLITUDE = 256

let audioEl = null
let loopUrl = null
let retryOnGesture = null
// Priming plays and then immediately pauses, but both halves are async and a
// rest can start in between — without this flag the prime's pause lands
// after the real start and silently stops the loop that had just begun,
// which takes the whole lock-screen session down with it.
let wantPlaying = false
let lastPlayError = null
let startCount = 0
// Reaching the Settings readout means leaving the Train tab, which unmounts
// the rest timer and tears the session down — so live state is always "none"
// by the time anyone reads it. This log is what actually survives to be
// reported back.
const events = []

function note(text) {
  const at = new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  events.push(`${at} — ${text}`)
  if (events.length > 8) events.shift()
}

function isSupported() {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator && typeof MediaMetadata !== 'undefined'
}

// 16-bit mono PCM — the format every decoder handles. (8-bit WAV is a real
// decoding risk on iOS, which is not a place to be clever.)
function nearSilentLoopUrl() {
  if (loopUrl) return loopUrl
  const frames = Math.round(SAMPLE_RATE * LOOP_SECONDS)
  const dataBytes = frames * 2
  const buffer = new ArrayBuffer(44 + dataBytes)
  const view = new DataView(buffer)
  const writeText = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + dataBytes, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true) // PCM
  view.setUint16(22, 1, true) // mono
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true) // byte rate
  view.setUint16(32, 2, true) // block align
  view.setUint16(34, 16, true) // bits per sample
  writeText(36, 'data')
  view.setUint32(40, dataBytes, true)
  for (let i = 0; i < frames; i++) {
    view.setInt16(44 + i * 2, Math.round(AMPLITUDE * Math.sin((2 * Math.PI * TONE_HZ * i) / SAMPLE_RATE)), true)
  }
  loopUrl = URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
  return loopUrl
}

function ensureAudioElement() {
  if (audioEl) return audioEl
  if (typeof Audio === 'undefined') return null
  audioEl = new Audio(nearSilentLoopUrl())
  audioEl.loop = true
  audioEl.preload = 'auto'
  audioEl.setAttribute('playsinline', '')
  return audioEl
}

function play(el) {
  const started = el.play()
  if (!started?.catch) return
  started
    .then(() => {
      lastPlayError = null
      note(`audio playing (${Number.isFinite(el.duration) ? Math.round(el.duration) : '?'}s track)`)
    })
    .catch((error) => {
      lastPlayError = `${error?.name ?? 'Error'}: ${error?.message ?? ''}`.slice(0, 140)
      note(`play rejected — ${error?.name ?? 'Error'}`)
      armGestureRetry(el)
    })
}

// Whether a phone actually surfaces any of this is decided by the browser and
// the OS, silently — setting metadata always "succeeds" from JS even when
// nothing is shown. So the app can't detect it; this is what the Settings
// readout prints so a real device can be diagnosed from the outside.
export function getLockScreenStatus() {
  const hasSession = typeof navigator !== 'undefined' && 'mediaSession' in navigator
  return {
    mediaSession: hasSession,
    positionState: hasSession && typeof navigator.mediaSession.setPositionState === 'function',
    playbackState: hasSession ? navigator.mediaSession.playbackState : null,
    audioCreated: !!audioEl,
    audioPlaying: audioEl ? !audioEl.paused : null,
    audioSeconds: audioEl && Number.isFinite(audioEl.duration) ? Math.round(audioEl.duration) : null,
    audioReady: audioEl ? audioEl.readyState : null,
    audioErrorCode: audioEl?.error ? audioEl.error.code : null,
    starts: startCount,
    lastPlayError,
    events: [...events].reverse(),
  }
}

// A play() that lands outside the user-activation window is rejected, and
// then nothing shows on the lock screen at all. Rather than give up, wait
// for the next tap anywhere in the app and try again.
function armGestureRetry(el) {
  if (retryOnGesture || typeof document === 'undefined') return
  retryOnGesture = () => {
    document.removeEventListener('pointerdown', retryOnGesture)
    retryOnGesture = null
    el.play().catch(() => {})
  }
  document.addEventListener('pointerdown', retryOnGesture)
}

// Called from a real tap (see ActiveWorkout's toggleComplete) — an element's
// first play() has to come from a gesture, so priming it there is what makes
// the later, render-driven start actually reach the lock screen.
export function primeLockScreenTimer() {
  try {
    const el = ensureAudioElement()
    if (!el || !el.paused) return
    const started = el.play()
    if (started?.then) {
      started
        .then(() => {
          if (wantPlaying) return
          el.pause()
          el.currentTime = 0
        })
        .catch(() => {})
    }
  } catch {
    // Best-effort only — never let this break the workout.
  }
}

export function startLockScreenTimer(label, totalSeconds, remainingSeconds) {
  try {
    if (!isSupported()) return
    const el = ensureAudioElement()
    if (!el) return
    wantPlaying = true
    startCount += 1
    note(`rest started (${totalSeconds}s)`)
    play(el)
    navigator.mediaSession.metadata = new MediaMetadata({ title: label, artist: 'Gym Tracker', album: 'Rest Timer' })
    navigator.mediaSession.playbackState = 'playing'
    updateLockScreenPosition(totalSeconds, remainingSeconds)
    // The widget offers play/pause; neither should actually stop a countdown
    // the phone has no way to resume without reopening the app, so both just
    // reassert "playing".
    navigator.mediaSession.setActionHandler('play', () => {
      play(el)
      navigator.mediaSession.playbackState = 'playing'
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      navigator.mediaSession.playbackState = 'playing'
    })
  } catch {
    // Best-effort only.
  }
}

// Cheap enough to re-assert on every tick, which corrects any drift while
// the OS interpolates the seconds in between.
export function updateLockScreenPosition(totalSeconds, remainingSeconds) {
  try {
    if (!isSupported() || typeof navigator.mediaSession.setPositionState !== 'function') return
    const duration = Math.max(1, totalSeconds)
    const position = Math.min(duration, Math.max(0, duration - remainingSeconds))
    navigator.mediaSession.setPositionState({ duration, position, playbackRate: 1 })
  } catch {
    // Best-effort only.
  }
}

// For the one-off text change when rest finishes — not for the countdown,
// which rides on position state instead.
export function updateLockScreenLabel(label) {
  try {
    if (!isSupported() || !navigator.mediaSession.metadata) return
    navigator.mediaSession.metadata = new MediaMetadata({ title: label, artist: 'Gym Tracker', album: 'Rest Timer' })
  } catch {
    // Best-effort only.
  }
}

export function stopLockScreenTimer() {
  try {
    if (wantPlaying) note('session stopped')
    wantPlaying = false
    if (retryOnGesture && typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', retryOnGesture)
      retryOnGesture = null
    }
    audioEl?.pause()
    if (!isSupported()) return
    navigator.mediaSession.metadata = null
    navigator.mediaSession.playbackState = 'none'
    navigator.mediaSession.setActionHandler('play', null)
    navigator.mediaSession.setActionHandler('pause', null)
  } catch {
    // Best-effort only.
  }
}
