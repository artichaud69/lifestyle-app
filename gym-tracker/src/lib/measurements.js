// Body measurement entries are sparse by nature — a single entry only
// carries whichever fields were actually measured that day, so every
// lookup here is per-field rather than assuming a fixed shape.
export const MEASUREMENT_FIELDS = [
  {
    key: 'neck',
    label: 'Neck',
    howTo: 'Wrap the tape around the middle of your neck, just below the Adam\'s apple. Keep it level and snug, not tight.',
  },
  {
    key: 'shoulders',
    label: 'Shoulders',
    howTo: 'Measure straight across the back from the outer tip of one shoulder to the outer tip of the other, arms relaxed at your sides.',
  },
  {
    key: 'chest',
    label: 'Chest',
    howTo: 'Wrap the tape around your chest at nipple height, arms relaxed at your sides, keeping the tape level front and back.',
  },
  {
    key: 'waist',
    label: 'Waist',
    howTo: 'Measure around the narrowest part of your torso, usually just above the belly button. Breathe normally — don\'t suck in.',
  },
  {
    key: 'hips',
    label: 'Hips',
    howTo: 'Measure around the widest part of your hips and glutes, feet together.',
  },
  {
    key: 'biceps',
    label: 'Biceps',
    howTo: 'Flex the arm and measure around the largest part of the upper arm. Use the same arm and flex state every time for consistency.',
  },
  {
    key: 'thighs',
    label: 'Thighs',
    howTo: 'Measure around the largest part of one thigh, just below the glute crease, standing with weight even on both legs.',
  },
  {
    key: 'calves',
    label: 'Calves',
    howTo: 'Measure around the widest part of your calf, standing with weight evenly distributed on both feet.',
  },
]

export function sortByDate(entries) {
  return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function fieldHistory(entries, field) {
  return sortByDate(entries)
    .filter((entry) => typeof entry.values?.[field] === 'number')
    .map((entry) => ({ date: entry.date, value: entry.values[field] }))
}

export function latestValue(entries, field) {
  const history = fieldHistory(entries, field)
  return history.length ? history[history.length - 1].value : null
}

// The delta against the previous log of this field, not the very first one
// ever recorded — matches the same reasoning as bodyweight's change stat.
export function changeSincePrevious(entries, field) {
  const history = fieldHistory(entries, field)
  if (history.length < 2) return null
  return history[history.length - 1].value - history[history.length - 2].value
}

// Only offer fields that actually have data to chart, so a fresh field
// selector doesn't show empty tabs for measurements never logged.
export function fieldsWithData(entries) {
  return MEASUREMENT_FIELDS.filter((field) => fieldHistory(entries, field.key).length > 0)
}
