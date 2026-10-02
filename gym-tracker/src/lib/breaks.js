// Training breaks: holidays, illness, a busy fortnight. A break is a stretch
// with no workout of any kind logged, so it is read off the log dates rather
// than declared — and because it is derived, logging a past session late
// simply re-derives it.
//
// A break is global on purpose. A lift you only train every ten days hasn't
// been "on a break" if you trained everything else in between; only a gap in
// all training is a detraining signal.

// Shortest gap, in days between workouts, that counts as a break. A missed
// week with a session either side lands at 8-9 days and is left alone; a
// two-week holiday lands well past it.
export const BREAK_MIN_DAYS = 10

// How hard to ease back in, by break length. `reduction` is the first
// session's load cut; `sessions` is how many sessions it takes to step back up
// to the pre-break load. Kept deliberately conservative: strength comes back
// fast after a short layoff, so the point is to re-groove, not to rebuild from
// scratch.
const REBUILD_PLANS = [
  { minDays: 35, reduction: 0.2, sessions: 4 },
  { minDays: 21, reduction: 0.15, sessions: 3 },
  { minDays: BREAK_MIN_DAYS, reduction: 0.1, sessions: 2 },
]

const DAY_MS = 24 * 60 * 60 * 1000

// Log dates are YYYY-MM-DD; reading them as UTC day numbers keeps the
// arithmetic free of time zones and daylight saving.
export function dayNumber(isoDate) {
  const [y, m, d] = String(isoDate).slice(0, 10).split('-').map(Number)
  return Math.round(Date.UTC(y, m - 1, d) / DAY_MS)
}

// Every distinct day with any logged workout, ascending.
export function trainingDays(logs) {
  const days = new Set()
  for (const log of logs ?? []) {
    if (log?.date && (log.entries ?? []).length > 0) days.add(dayNumber(log.date))
  }
  return [...days].sort((a, b) => a - b)
}

// The longest stretch with no training between two days (inclusive), in days.
export function longestGapBetween(days, fromDay, toDay) {
  if (!(toDay > fromDay)) return 0
  let longest = 0
  let previous = fromDay
  for (const day of days) {
    if (day <= fromDay) continue
    if (day >= toDay) break
    longest = Math.max(longest, day - previous)
    previous = day
  }
  return Math.max(longest, toDay - previous)
}

// The rebuild a break of `days` calls for, or null when it isn't a break.
export function rebuildPlan(days) {
  if (!(days >= BREAK_MIN_DAYS)) return null
  const plan = REBUILD_PLANS.find((p) => days >= p.minDays)
  return { days, reduction: plan.reduction, sessions: plan.sessions }
}

// Days since the last workout of any kind, or null with nothing logged.
export function daysSinceLastWorkout(logs, todayIso) {
  const days = trainingDays(logs)
  if (days.length === 0) return null
  return dayNumber(todayIso) - days[days.length - 1]
}
