import { toISODate } from './dates.js'

export function currentStreak(doneDates) {
  const doneSet = new Set(doneDates)
  const cursor = new Date()
  if (!doneSet.has(toISODate(cursor))) {
    // today isn't checked off yet, but the streak isn't broken until the day
    // fully passes - so give it a grace day and start counting from yesterday
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (doneSet.has(toISODate(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function bestStreak(doneDates) {
  if (doneDates.length === 0) return 0
  const sorted = [...doneDates].sort()
  let best = 1
  let current = 1
  for (let i = 1; i < sorted.length; i++) {
    const [py, pm, pd] = sorted[i - 1].split('-').map(Number)
    const [cy, cm, cd] = sorted[i].split('-').map(Number)
    const prevDate = new Date(py, pm - 1, pd)
    const currDate = new Date(cy, cm - 1, cd)
    const diffDays = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24))
    if (diffDays === 1) {
      current++
      best = Math.max(best, current)
    } else if (diffDays > 1) {
      current = 1
    }
  }
  return best
}
