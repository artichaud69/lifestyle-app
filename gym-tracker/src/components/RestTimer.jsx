import { useEffect, useRef, useState } from 'react'
import { playRestOverChime, vibrate } from '../lib/sound.js'

function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Rest has two distinct, unmistakable phases: counting down ("resting"),
// then a "go" flash with a chime + vibration the moment it hits zero, held
// for a couple of seconds before the pill clears itself — so finishing rest
// is an event you notice, not a number that quietly disappears.
function RestTimer({ totalSeconds, timerKey, onDone }) {
  const [remaining, setRemaining] = useState(totalSeconds)
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
    setRemaining(totalSeconds)
    setPhase('resting')
    announcedRef.current = false
  }, [timerKey, totalSeconds])

  useEffect(() => {
    if (remaining > 0) {
      const id = setInterval(() => setRemaining((r) => r - 1), 1000)
      return () => clearInterval(id)
    }
    if (!announcedRef.current) {
      announcedRef.current = true
      playRestOverChime()
      vibrate([120, 80, 120])
      setPhase('go')
    }
    const id = setTimeout(() => onDoneRef.current?.(), 2500)
    return () => clearTimeout(id)
  }, [remaining])

  const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, 1 - remaining / totalSeconds)) : 1

  return (
    <div className="rest-timer-bar">
      <div className={`rest-timer-pill${phase === 'go' ? ' go' : ''}`} onClick={phase === 'go' ? () => onDone?.() : undefined}>
        <div className="rest-timer-progress" style={{ width: `${progress * 100}%` }} />
        <div className="rest-timer-content">
          {phase === 'resting' ? (
            <>
              <span className="rest-timer-label">RESTING</span>
              <span className="rest-timer-clock">{formatClock(Math.max(0, remaining))}</span>
              <button type="button" onClick={() => setRemaining((r) => r + 30)}>
                +30s
              </button>
              <button type="button" onClick={() => setRemaining(0)}>
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
