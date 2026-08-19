export const PAGE_ICONS = {
  habits: 'icons/nav-habits.png',
  goals: 'icons/nav-goals.png',
  summary: 'icons/nav-summary.png',
  journal: 'icons/nav-journal.png',
  health: 'icons/nav-health.png',
  oraison: 'icons/nav-oraison.png',
  gratitude: 'icons/nav-gratitude.png',
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
}

// Navigation is hub and spoke: Summary is the one page you launch from, and
// every other page hangs off it. A tab bar listing all of them had grown too
// crowded to read, and this shape stays the same however many pages arrive.
export const HUB_VIEW = 'summary'

// Grid order on the hub, grouped by what the page is for: things you track,
// then things you reflect on.
export const SPOKES = [
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
  { key: 'health', label: 'Health' },
  { key: 'journal', label: 'Journal' },
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'oraison', label: 'Oraison' },
]

export const ALL_VIEWS = [HUB_VIEW, ...SPOKES.map((spoke) => spoke.key)]
