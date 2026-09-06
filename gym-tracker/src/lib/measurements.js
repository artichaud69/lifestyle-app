// Body measurement entries are sparse by nature — a single entry only
// carries whichever fields were actually measured that day, so every
// lookup here is per-field rather than assuming a fixed shape.
export const MEASUREMENT_FIELDS = [
  { key: 'neck', label: 'Neck' },
  { key: 'shoulders', label: 'Shoulders' },
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'biceps', label: 'Biceps' },
  { key: 'thighs', label: 'Thighs' },
  { key: 'calves', label: 'Calves' },
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
