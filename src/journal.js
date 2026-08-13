const JOURNAL_KEY = 'lifestyle-app.journal'

export const MOODS = [
  { value: 1, emoji: '😞', label: 'Awful' },
  { value: 2, emoji: '😕', label: 'Not great' },
  { value: 3, emoji: '😐', label: 'Okay' },
  { value: 4, emoji: '🙂', label: 'Good' },
  { value: 5, emoji: '😄', label: 'Great' },
]

export function loadJournal() {
  const raw = localStorage.getItem(JOURNAL_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveJournal(entries) {
  localStorage.setItem(JOURNAL_KEY, JSON.stringify(entries))
}
