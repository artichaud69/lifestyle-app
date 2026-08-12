const STORAGE_KEY = 'lifestyle-app.habits'

export function loadHabits() {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveHabits(habits) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habits))
}
