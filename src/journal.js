const JOURNAL_KEY = 'lifestyle-app.journal'

export const MOODS = [
  { value: 1, label: 'Awful' },
  { value: 2, label: 'Not great' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Great' },
]

function migrateEntry(value) {
  // entries used to be a plain mood number, before notes existed
  if (typeof value === 'number') return { mood: value, note: '' }
  return value
}

export function loadJournal() {
  const raw = localStorage.getItem(JOURNAL_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    const migrated = {}
    for (const [date, value] of Object.entries(parsed)) {
      migrated[date] = migrateEntry(value)
    }
    return migrated
  } catch {
    return {}
  }
}

export function saveJournal(entries) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries))
}
