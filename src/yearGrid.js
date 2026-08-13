import { toISODate, todayISO } from './dates.js'
import { WEEK_STARTS_ON } from './frequency.js'

// 53 weeks of 7 days each, aligned so every row is the same weekday across
// all columns. Days after today (within the final, still-in-progress week)
// come back as null.
export function buildYearWeeks() {
  const today = new Date()
  const todayStr = todayISO()

  const roughStart = new Date(today)
  roughStart.setDate(roughStart.getDate() - 370)
  const diff = (roughStart.getDay() - WEEK_STARTS_ON + 7) % 7
  const alignedStart = new Date(roughStart)
  alignedStart.setDate(alignedStart.getDate() - diff)

  const weeks = []
  const cursor = new Date(alignedStart)
  while (cursor <= today) {
    const week = []
    for (let i = 0; i < 7; i++) {
      const iso = toISODate(cursor)
      week.push(iso > todayStr ? null : iso)
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}
