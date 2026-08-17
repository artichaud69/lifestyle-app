import { useEffect, useState } from 'react'

function formatClock(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function RestTimer({ totalSeconds, timerKey, onDone }) {
  const [remaining, setRemaining] = useState(totalSeconds)

  useEffect(() => {
    setRemaining(totalSeconds)
  }, [timerKey, totalSeconds])

  useEffect(() => {
    if (remaining <= 0) {
      onDone?.()
      return
    }
    const id = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(id)
  }, [remaining, onDone])

  return (
    <div className="rest-timer-bar">
      <div className="rest-timer-pill">
        <span>Rest {formatClock(Math.max(0, remaining))}</span>
        <button type="button" onClick={() => setRemaining((r) => r + 30)}>
          +30s
        </button>
        <button type="button" onClick={() => setRemaining(0)}>
          Skip
        </button>
      </div>
    </div>
  )
}

export default RestTimer
