import { weeksList, countsByWeek, isCompleteWeek } from './frequency.js'

export function currentStreak(startDate, doneDates, timesPerWeek) {
  const weeks = weeksList(startDate)
  if (weeks.length === 0) return 0
  const counts = countsByWeek(doneDates)

  let streak = 0
  for (let i = weeks.length - 1; i >= 0; i--) {
    const week = weeks[i]
    const met = (counts[week] ?? 0) >= timesPerWeek
    if (met) {
      streak++
    } else if (!isCompleteWeek(week, startDate)) {
      // partial week (first or current) - doesn't break the streak
      continue
    } else {
      break
    }
  }
  return streak
}

export function bestStreak(startDate, doneDates, timesPerWeek) {
  const weeks = weeksList(startDate)
  const counts = countsByWeek(doneDates)

  let best = 0
  let current = 0
  for (const week of weeks) {
    const met = (counts[week] ?? 0) >= timesPerWeek
    if (met) {
      current++
      best = Math.max(best, current)
    } else if (!isCompleteWeek(week, startDate)) {
      continue
    } else {
      current = 0
    }
  }
  return best
}
