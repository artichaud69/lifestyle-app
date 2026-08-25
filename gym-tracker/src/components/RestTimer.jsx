import { useEffect, useRef, useState } from 'react'
import { playRestOverChime, vibrate } from '../lib/sound.js'

function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function remainingFrom(endsAt) {
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 1000))
}

// Rest has two distinct, unmistakable phases: counting down ("resting"),
// then a "go" flash with a chime + vibration the moment it hits zero, held
// for a couple of seconds before the pill clears itself — so finishing rest
// is an event you notice, not a number that quietly disappears.
//
// `rest` is a real end-timestamp ({ startedAt, endsAt }, both persisted on
// the workout draft), not a tick counter — a backgrounded/locked phone
// throttles or fully suspends setInterval, so counting down by decrementing
// a number falls behind and never catches up. Computing remaining time from
// the wall clock means the very next tick (or a visibilitychange/focus
// event, forced on resume so it doesn't wait up to a second) always shows
// the true remaining time, including "0" if rest actually finished while
// the screen was off.
function RestTimer({ rest, onDone, onExtend, onSkip }) {
  const [remaining, setRemaining] = useState(() => remainingFrom(rest.endsAt))
  const [phase, setPhase] = useState('resting')
  const announcedRef = useRef(false)
  // The parent re-renders every second (its own elapsed-time tick), which
  // would recreate an inline onDone handler and — if onDone were a real
  // effect dependency — cancel and reschedule the 2.5s "go" auto-dismiss
  // before it ever got the chance to fire. Reading it through a ref keeps
  // scheduling keyed only on `remaining`, immune to the parent's churn.
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    setPhase('resting')
    announcedRef.current = false
  }, [rest.startedAt])

  useEffect(() => {
    function recompute() {
      setRemaining(remainingFrom(rest.endsAt))
    }
    recompute()
    const id = setInterval(recompute, 1000)
    document.addEventListener('visibilitychange', recompute)
    window.addEventListener('focus', recompute)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', recompute)
      window.removeEventListener('focus', recompute)
    }
  }, [rest.endsAt])

  useEffect(() => {
    if (remaining > 0) return
    if (!announcedRef.current) {
      announcedRef.current = true
      playRestOverChime()
      vibrate([120, 80, 120])
      setPhase('go')
    }
    const id = setTimeout(() => onDoneRef.current?.(), 2500)
    return () => clearTimeout(id)
  }, [remaining])

  const totalSeconds = Math.max(1, Math.round((rest.endsAt - rest.startedAt) / 1000))
  const progress = Math.max(0, Math.min(1, 1 - remaining / totalSeconds))

  return (
    <div className="rest-timer-bar">
      <div className={`rest-timer-pill${phase === 'go' ? ' go' : ''}`} onClick={phase === 'go' ? () => onDoneRef.current?.() : undefined}>
        <div className="rest-timer-progress" style={{ width: `${progress * 100}%` }} />
        <div className="rest-timer-content">
          {phase === 'resting' ? (
            <>
              <span className="rest-timer-label">RESTING</span>
              <span className="rest-timer-clock">{formatClock(remaining)}</span>
              <button type="button" onClick={onExtend}>
                +30s
              </button>
              <button type="button" onClick={onSkip}>
                Skip
              </button>
            </>
          ) : (
            <span className="rest-timer-go">Rest over — start your next set</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestTimer
