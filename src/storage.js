import { todayISO } from './dates.js'
import { DAILY } from './frequency.js'

const STORAGE_KEY = 'lifestyle-app.habits'

function migrateHabit(habit) {
  const migrated = { ...habit }
  if (!migrated.startDate) {
    // habits saved before startDate existed used createdAt for the same purpose
    migrated.startDate = migrated.createdAt ?? todayISO()
  }
  if (!migrated.timesPerWeek) {
    if (migrated.schedule) {
      // habits saved under the brief day-of-week schedule model: carry the
      // day count forward as an equivalent times-per-week target
      migrated.timesPerWeek = migrated.schedule.length
    } else {
      // habits saved before any frequency concept existed were always daily
      migrated.timesPerWeek = DAILY
    }
  }
  return migrated
}

export function loadHabits() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const habits = JSON.parse(raw)
    return habits.map(migrateHabit)
  } catch {
    return null
  }
}

export function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}
