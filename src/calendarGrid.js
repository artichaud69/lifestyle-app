import { toISODate } from './dates.js'

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const MONTH_NAMES_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function addMonths(year, month, delta) {
  const total = year * 12 + month + delta
  return { year: Math.floor(total / 12), month: ((total % 12) + 12) % 12 }
}

export function entryYears(entries) {
  const years = new Set()
  for (const date of Object.keys(entries)) {
    years.add(Number(date.slice(0, 4)))
  }
  return years
}

export function buildMonthGrid(year, month, weekStartsOn) {
  const firstOfMonth = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const leadingEmpty = (firstOfMonth.getDay() - weekStartsOn + 7) % 7

  const cells = []
  for (let i = 0; i < leadingEmpty; i++) {
    cells.push(null)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: toISODate(new Date(year, month, day)), day })
  }
  while (cells.length % 7 !== 0) {
    cells.push(null)
  }

  const weeks = []
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7))
  }
  return weeks
}

export function weekdayLabels(weekStartsOn) {
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  return [...labels.slice(weekStartsOn), ...labels.slice(0, weekStartsOn)]
}
