import { useState, useEffect } from 'react'
import Button from './ui/Button.jsx'

const PHASES = [
  { key: 'inhale', label: 'Breathe in' },
  { key: 'hold-in', label: 'Hold' },
  { key: 'exhale', label: 'Breathe out' },
  { key: 'hold-out', label: 'Hold' },
]
const PHASE_MS = 4000

// Box breathing: 4s in, 4s hold, 4s out, 4s hold. The circle only needs two
// target sizes - inhale and hold-in share one, exhale and hold-out share the
// other - so a CSS transition can carry the motion with no per-frame JS, and
// reduced-motion users get the same phases with the size change removed.
function BreathingExercise() {
  const [active, setActive] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    if (!active) return
    const timer = setInterval(() => {
      setPhaseIndex((index) => (index + 1) % PHASES.length)
    }, PHASE_MS)
    return () => clearInterval(timer)
  }, [active])

  function toggle() {
    setPhaseIndex(0)
    setActive((was) => !was)
  }

  const phase = PHASES[phaseIndex]

  return (
    <div className="breathing">
      <div className={`breathing-circle${active ? ` is-${phase.key}` : ''}`}>
        <span className="breathing-label">{active ? phase.label : 'Ready'}</span>
      </div>
      <Button variant={active ? 'secondary' : 'primary'} onClick={toggle}>
        {active ? 'Stop' : 'Start breathing'}
      </Button>
    </div>
  )
}

export default BreathingExercise
