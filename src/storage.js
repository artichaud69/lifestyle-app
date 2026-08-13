import { todayISO } from './dates.js'
import { ALL_DAYS } from './schedule.js'

const STORAGE_KEY = 'lifestyle-app.habits'

function migrateHabit(habit) {
  const migrated = { ...habit }
  if (!migrated.startDate) {
    // habits saved before startDate existed used createdAt for the same purpose
    migrated.startDate = migrated.createdAt ?? todayISO()
  }
  if (!migrated.schedule) {
    // habits saved before schedules existed were always daily
    migrated.schedule = ALL_DAYS
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
