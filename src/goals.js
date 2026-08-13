import { notifyDataChanged } from './dataChange.js'

const GOALS_KEY = 'lifestyle-app.goals'

export function loadGoals() {
  const raw = localStorage.getItem(GOALS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export function saveGoals(goals) {
  localStorage.setItem(GOALS_KEY, JSON.stringify(goals))
  notifyDataChanged()
}
