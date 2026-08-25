// A standard percentage ramp up to a working weight - light and higher-rep
// first, heavier and lower-rep as it approaches the working set. Common
// enough that most lifters do roughly this by feel; this just saves the
// arithmetic.
const RAMP = [
  { percent: 0.4, reps: 10 },
  { percent: 0.6, reps: 5 },
  { percent: 0.8, reps: 3 },
]

// Below this there's nothing meaningful to ramp up to - bodyweight moves and
// light isolation work don't need a warm-up ramp.
const MIN_WEIGHT_FOR_RAMP = 20

function roundToStep(value, step) {
  return Math.max(step, Math.round(value / step) * step)
}

export function suggestWarmupSets(workingWeight, unit = 'kg') {
  const weight = Number(workingWeight)
  if (!weight || weight < MIN_WEIGHT_FOR_RAMP) return []
  const step = unit === 'kg' ? 2.5 : 5
  return RAMP.map(({ percent, reps }) => ({
    weight: roundToStep(weight * percent, step),
    reps,
    rpe: '',
    completed: false,
    isWarmup: true,
  }))
}
