import { startOfWeek, datesBetween, todayISO } from './dates.js'

export const WEEK_STARTS_ON = 1 // Monday
export const DAILY = 7

// All weeks (as their Monday-start date) touched by the range startDate..today, in order.
export function weeksList(startDate) {
  const weeks = []
  const seen = new Set()
  for (const date of datesBetween(startDate, todayISO())) {
    const week = startOfWeek(date, WEEK_STARTS_ON)
    if (!seen.has(week)) {
      seen.add(week)
      weeks.push(week)
    }
  }
  return weeks
}

export function countsByWeek(doneDates) {
  const counts = {}
  for (const date of doneDates) {
    const week = startOfWeek(date, WEEK_STARTS_ON)
    counts[week] = (counts[week] ?? 0) + 1
  }
  return counts
}

// A week only has to meet the target to keep a streak alive if it's a full
// Monday-Sunday week entirely within the habit's history - not the first
// week (if the habit started mid-week) and not the current week (always
// still in progress).
export function isCompleteWeek(week, startDate) {
  const currentWeek = startOfWeek(todayISO(), WEEK_STARTS_ON)
  if (week === currentWeek) return false
  const firstWeek = startOfWeek(startDate, WEEK_STARTS_ON)
  if (week === firstWeek && startDate !== firstWeek) return false
  return true
}

export function weeklyCompletionPercent(startDate, doneDates, timesPerWeek) {
  const weeks = weeksList(startDate)
  if (weeks.length === 0) return 0
  const counts = countsByWeek(doneDates)

  const completeWeeks = weeks.filter((week) => isCompleteWeek(week, startDate))
  const weeksToAverage = completeWeeks.length > 0 ? completeWeeks : weeks

  const totalRatio = weeksToAverage.reduce((sum, week) => sum + Math.min((counts[week] ?? 0) / timesPerWeek, 1), 0)
  return Math.round((totalRatio / weeksToAverage.length) * 100)
}
