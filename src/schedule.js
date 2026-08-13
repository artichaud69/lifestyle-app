export const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6]
export const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function isScheduled(dateISO, schedule) {
  const [year, month, day] = dateISO.split('-').map(Number)
  const weekday = new Date(year, month - 1, day).getDay()
  return schedule.includes(weekday)
}
