import { datesBetween, todayISO } from './dates.js'
import { isScheduled } from './schedule.js'

function scheduledDatesUpToToday(doneDates, schedule) {
  if (doneDates.length === 0) return []
  const earliest = [...doneDates].sort()[0]
  return datesBetween(earliest, todayISO()).filter((date) => isScheduled(date, schedule))
}

export function currentStreak(doneDates, schedule) {
  const doneSet = new Set(doneDates)
  const scheduledDates = scheduledDatesUpToToday(doneDates, schedule)
  const today = todayISO()

  let streak = 0
  for (let i = scheduledDates.length - 1; i >= 0; i--) {
    const date = scheduledDates[i]
    if (doneSet.has(date)) {
      streak++
    } else if (date === today) {
      // today isn't checked off yet, but the streak isn't broken until the day
      // fully passes - so skip it (grace day) instead of breaking the streak
      continue
    } else {
      break
    }
  }
  return streak
}

export function bestStreak(doneDates, schedule) {
  const doneSet = new Set(doneDates)
  const scheduledDates = scheduledDatesUpToToday(doneDates, schedule)

  let best = 0
  let current = 0
  for (const date of scheduledDates) {
    if (doneSet.has(date)) {
      current++
      best = Math.max(best, current)
    } else {
      current = 0
    }
  }
  return best
}
