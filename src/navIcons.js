export const PAGE_ICONS = {
  habits: 'icons/nav-habits.png',
  goals: 'icons/nav-goals.png',
  summary: 'icons/nav-summary.png',
  journal: 'icons/nav-journal.png',
  health: 'icons/nav-health.png',
  oraison: 'icons/nav-oraison.png',
  gratitude: 'icons/nav-gratitude.png',
  anxiety: 'icons/nav-anxiety.png',
  settings: 'icons/nav-summary.png',
}

// Each page opens on a band of its own artwork. Kept beside the icons so a
// page's identity - its mark and its image - lives in one place.
export const PAGE_HEROES = {
  habits: 'images/habits-wallpaper.jpg',
  goals: 'images/goals-wallpaper.jpg',
  summary: 'images/theme-wallpaper.jpg',
  journal: 'images/journal-wallpaper.jpg',
  health: 'images/health-wallpaper.jpg',
  oraison: 'images/oraison-wallpaper.jpg',
  gratitude: 'images/theme-wallpaper.jpg',
  anxiety: 'images/theme-wallpaper.jpg',
  settings: 'images/theme-wallpaper.jpg',
}

// Navigation is hub and spoke: Summary is the one page you launch from, and
// every other page hangs off it. A tab bar listing all of them had grown too
// crowded to read, and this shape stays the same however many pages arrive.
export const HUB_VIEW = 'summary'

// Sits one step to the left of the hub, so swiping right from Summary pulls
// it in the way a drawer would - but as a real page, which means it is
// finger-tracked by the same code as everything else.
export const SETTINGS_VIEW = 'settings'

// Grid order on the hub, grouped by what the page is for: things you track,
// then things you reflect on.
export const SPOKES = [
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
  { key: 'health', label: 'Health' },
  { key: 'journal', label: 'Journal' },
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'anxiety', label: 'Anxiety' },
  { key: 'oraison', label: 'Oraison' },
]

export const ALL_VIEWS = [SETTINGS_VIEW, HUB_VIEW, ...SPOKES.map((spoke) => spoke.key)]
