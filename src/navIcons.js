export const PAGE_ICONS = {
  habits: 'icons/nav-habits.png',
  goals: 'icons/nav-goals.png',
  summary: 'icons/nav-summary.png',
  journal: 'icons/nav-journal.png',
  health: 'icons/nav-health.png',
  oraison: 'icons/nav-oraison.png',
  gratitude: 'icons/nav-gratitude.png',
}

// Left-to-right order of the tab bar. Swipe navigation walks the same list,
// so the two can never disagree about what sits next to what.
export const VIEWS = [
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
  { key: 'summary', label: 'Summary' },
  { key: 'journal', label: 'Journal' },
  { key: 'health', label: 'Health' },
  { key: 'oraison', label: 'Oraison' },
  { key: 'gratitude', label: 'Gratitude' },
]

export const VIEW_ORDER = VIEWS.map((entry) => entry.key)
