import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import IconButton from './ui/IconButton.jsx'

const STEPS = [
  { count: 5, sense: 'you can see' },
  { count: 4, sense: 'you can touch' },
  { count: 3, sense: 'you can hear' },
  { count: 2, sense: 'you can smell' },
  { count: 1, sense: 'you can taste' },
]

// The 5-4-3-2-1 technique. Stepped rather than listed all at once, the same
// way HabitWeek steps through one week at a time - one prompt to focus on.
function GroundingExercise() {
  const [index, setIndex] = useState(0)
  const step = STEPS[index]

  return (
    <div className="grounding">
      <p className="grounding-prompt">
        Name <strong>{step.count}</strong> things {step.sense}
      </p>
      <div className="grounding-nav">
        <IconButton
          label="Previous"
          icon={ChevronLeft}
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
          disabled={index === 0}
        />
        <span className="caption">
          {index + 1} / {STEPS.length}
        </span>
        <IconButton
          label="Next"
          icon={ChevronRight}
          onClick={() => setIndex((current) => Math.min(STEPS.length - 1, current + 1))}
          disabled={index === STEPS.length - 1}
        />
      </div>
    </div>
  )
}

export default GroundingExercise
