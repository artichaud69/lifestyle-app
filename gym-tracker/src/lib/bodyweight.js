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

// The bodyweight to use for something that happened on `date`: the entry
// logged that day; else the latest logged before it; else — for a date older
// than every entry — the latest logged at all. Null with nothing logged:
// there is no sensible default bodyweight, and guessing one would quietly
// skew every estimate made with it.
export function bodyweightOn(entries, date) {
  const logged = sortByDate((entries ?? []).filter((entry) => entry?.date && Number(entry.weight) > 0))
  if (logged.length === 0) return null
  const day = String(date ?? '').slice(0, 10)
  let asOf = null
  for (const entry of logged) {
    if (entry.date.slice(0, 10) <= day) asOf = entry
  }
  return Number((asOf ?? logged[logged.length - 1]).weight)
}
