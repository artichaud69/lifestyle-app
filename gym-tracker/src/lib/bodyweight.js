export function sortByDate(entries) {
  return [...entries].sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function latestEntry(entries) {
  const sorted = sortByDate(entries)
  return sorted[sorted.length - 1] ?? null
}

// The delta against the previous log, not the very first one ever recorded
// — a multi-month baseline is rarely what "did today's number move" means,
// and this stays meaningful no matter how long the history gets.
export function changeSincePrevious(entries) {
  const sorted = sortByDate(entries)
  if (sorted.length < 2) return null
  return sorted[sorted.length - 1].weight - sorted[sorted.length - 2].weight
}
