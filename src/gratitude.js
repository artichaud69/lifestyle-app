import { notifyDataChanged } from './dataChange.js'
import { addDays } from './dates.js'

const GRATITUDE_KEY = 'lifestyle-app.gratitude'

// Three items, not a blank page: this is Seligman's "Three Good Things"
// exercise, the most-studied and most-copied format across gratitude apps -
// naming a fixed, small number of specific things beats an open prompt.
export const ENTRY_SIZE = 3

export function loadGratitude() {
  const raw = localStorage.getItem(GRATITUDE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export function saveGratitude(entries) {
  localStorage.setItem(GRATITUDE_KEY, JSON.stringify(entries))
  notifyDataChanged()
}

export function itemsForDay(entries, dateISO) {
  const items = entries[dateISO]
  return Array.isArray(items) ? items : []
}

export function hasEntry(entries, dateISO) {
  return itemsForDay(entries, dateISO).some((item) => item?.trim())
}

// Consecutive days with at least one filled item, walking back from today.
// A day not yet filled in doesn't break yesterday's streak - the day is
// still open, the same reasoning habit streaks use for the current week.
export function currentStreak(entries, todayISO) {
  let cursor = hasEntry(entries, todayISO) ? todayISO : addDays(todayISO, -1)
  let streak = 0
  while (hasEntry(entries, cursor)) {
    streak++
    cursor = addDays(cursor, -1)
  }
  return streak
}

export function bestStreak(entries, todayISO) {
  const filledDays = Object.keys(entries)
    .filter((date) => date <= todayISO && hasEntry(entries, date))
    .sort()

  let best = 0
  let current = 0
  let previous = null
  for (const date of filledDays) {
    current = previous && addDays(previous, 1) === date ? current + 1 : 1
    best = Math.max(best, current)
    previous = date
  }
  return best
}

// The same calendar date one year back, so a filled entry there can resurface
// as a gentle "a year ago today" callback - the flashback pattern the best
// gratitude apps use to make old entries feel worth having written.
export function sameDateLastYear(dateISO) {
  const [year, month, day] = dateISO.split('-')
  return `${Number(year) - 1}-${month}-${day}`
}

// Rotating, non-repeating-feeling prompts to soften the blank page - the
// single most-cited friction point across gratitude apps. Deterministic per
// day, the same way the daily quote is, so it holds still through the day.
const PROMPTS = [
  'Who made today a little easier?',
  'What small comfort did you almost overlook?',
  'What made you smile without trying to?',
  'What worked out better than expected?',
  'What’s something ordinary you’d miss if it were gone?',
  'Who are you glad to have in your life?',
  'What did your body let you do today?',
  'What did you learn, or get better at?',
  'What place gave you a moment of peace?',
  'What’s a problem from the past that no longer troubles you?',
  'What did someone else do for you, even something small?',
  'What are you looking forward to?',
  'What went right that you had no hand in?',
  'What’s a comfort of home you take for granted?',
  'What memory came back to you today?',
  'What’s something beautiful you noticed?',
  'What did you get to choose today?',
  'Who would you thank if they could hear it?',
]

export function promptForDate(dateISO) {
  let hash = 0
  for (let index = 0; index < dateISO.length; index++) {
    hash = (hash * 31 + dateISO.charCodeAt(index)) >>> 0
  }
  return PROMPTS[hash % PROMPTS.length]
}
