import { todayISO } from './dates.js'

const STORAGE_KEY = 'lifestyle-app.habits'

function migrateHabit(habit) {
  if (habit.startDate) return habit
  // habits saved before startDate existed used createdAt for the same purpose
  return { ...habit, startDate: habit.createdAt ?? todayISO() }
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
