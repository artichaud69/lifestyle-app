import { notifyDataChanged } from './dataChange.js'

const ANXIETY_KEY = 'lifestyle-app.anxiety'

// Three levels, not a numeric scale - fast to pick mid-episode, and it maps
// directly onto the app's existing success/warning/danger tokens.
export const SEVERITIES = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
]

export const TRIGGERS = ['Work', 'Health', 'Social', 'Sleep', 'Money', 'Relationship', 'Unknown']

export function loadEntries() {
  const raw = localStorage.getItem(ANXIETY_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveEntries(entries) {
  localStorage.setItem(ANXIETY_KEY, JSON.stringify(entries))
  notifyDataChanged()
}

// A flat, timestamped list rather than one entry per day - unlike a habit or
// a gratitude line, more than one episode can happen in the same day.
export function addEntry(entries, { severity, triggers, note }) {
  const entry = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    severity,
    triggers,
    note: note?.trim() ?? '',
  }
  return [entry, ...entries]
}

export function removeEntry(entries, id) {
  return entries.filter((entry) => entry.id !== id)
}

export function sortedByRecency(entries) {
  return [...entries].sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}

// The point of this feature is having as few episodes as possible, so there
// is no streak to track - just how often they're happening lately.
export function entriesInLastDays(entries, days, nowISO = new Date().toISOString()) {
  const cutoff = Date.parse(nowISO) - days * 24 * 60 * 60 * 1000
  return entries.filter((entry) => Date.parse(entry.at) >= cutoff)
}

export function groupByDay(entries) {
  const groups = {}
  for (const entry of sortedByRecency(entries)) {
    const day = entry.at.slice(0, 10)
    if (!groups[day]) groups[day] = []
    groups[day].push(entry)
  }
  return groups
}
