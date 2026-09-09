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
const LOOP_SECONDS = 0.5

let audioEl = null
let loopUrl = null
let retryOnGesture = null
// Priming plays and then immediately pauses, but both halves are async and a
// rest can start in between — without this flag the prime's pause lands
// after the real start and silently stops the loop that had just begun,
// which takes the whole lock-screen session down with it.
let wantPlaying = false

function isSupported() {
  return typeof navigator !== 'undefined' && 'mediaSession' in navigator && typeof MediaMetadata !== 'undefined'
}

// 8-bit mono PCM alternating between 128 and 129 every 40 samples: a 100Hz
// square wave one LSB tall (~-42dBFS), inaudible in practice but loud
// enough to count as real audio to the browser.
function nearSilentLoopUrl() {
  if (loopUrl) return loopUrl
  const frames = Math.round(SAMPLE_RATE * LOOP_SECONDS)
  const buffer = new ArrayBuffer(44 + frames)
  const view = new DataView(buffer)
  const writeText = (offset, text) => {
    for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i))
  }
  writeText(0, 'RIFF')
  view.setUint32(4, 36 + frames, true)
  writeText(8, 'WAVE')
  writeText(12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE, true)
  view.setUint16(32, 1, true)
  view.setUint16(34, 8, true)
  writeText(36, 'data')
  view.setUint32(40, frames, true)
  for (let i = 0; i < frames; i++) view.setUint8(44 + i, 128 + (Math.floor(i / 40) % 2))
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
  if (started?.catch) started.catch(() => armGestureRetry(el))
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
