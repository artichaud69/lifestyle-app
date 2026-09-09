// Generates its own beeps (Web Audio oscillator) instead of shipping an
// audio asset, so the rest-timer chime works offline like everything else
// in this PWA. The context is created lazily and reused; browsers only let
// it actually make sound after a user gesture has touched it once, so
// primeAudio() should be called from a real click/tap handler early in the
// workout (e.g. the first "complete set" tap) rather than from a timer.
let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext || window.webkitAudioContext
  if (!Ctor) return null
  if (!audioCtx) audioCtx = new Ctor()
  return audioCtx
}

export function primeAudio() {
  const ctx = getAudioContext()
  if (ctx?.state === 'suspended') ctx.resume().catch(() => {})
}

function beep(ctx, frequency, startOffset, durationMs) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  const start = ctx.currentTime + startOffset
  const end = start + durationMs / 1000
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(0.25, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, end)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  osc.stop(end + 0.02)
}

// Two-note ascending chime — "rest is over, go" — played when the rest
// timer hits zero.
export function playRestOverChime() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    beep(ctx, 660, 0, 130)
    beep(ctx, 880, 0.16, 220)
  } catch {
    // Audio is a nice-to-have; never let it break the workout.
  }
}

export function vibrate(pattern) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    // Vibration API isn't available everywhere (desktop, iOS Safari) - fine.
  }
}
