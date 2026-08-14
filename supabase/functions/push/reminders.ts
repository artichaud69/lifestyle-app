// Pure decision logic for the reminder job, kept apart from the Deno/web-push
// glue in index.ts so it can be unit tested (see reminders.test.ts).

export const WEEK_STARTS_ON = 1 // Monday, matching src/frequency.js

export type Habit = {
  name?: string
  doneDates?: string[]
  timesPerWeek?: number
}

// The date and hour where the subscriber actually is. Reminders are scheduled
// in local time, so an hourly job plus this is enough to hit 8pm for everyone
// without storing UTC offsets that would rot twice a year.
export function localParts(timezone: string, now: Date) {
  const date = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      hourCycle: 'h23',
    }).format(now),
  )
  return { date, hour }
}

export function startOfWeek(dateISO: string) {
  const [year, month, day] = dateISO.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  const diff = (date.getUTCDay() - WEEK_STARTS_ON + 7) % 7
  date.setUTCDate(date.getUTCDate() - diff)
  return date.toISOString().slice(0, 10)
}

// Worth a nudge only if it is not ticked today *and* its weekly target is not
// already met - so a 3x/week habit goes quiet once the third tick lands,
// instead of nagging on days it was never meant to be done.
export function habitsStillDue(habits: Habit[], today: string) {
  const week = startOfWeek(today)
  return (habits ?? []).filter((habit) => {
    const doneDates = habit?.doneDates ?? []
    if (doneDates.includes(today)) return false
    const timesPerWeek = habit?.timesPerWeek ?? 7
    const doneThisWeek = doneDates.filter((date) => startOfWeek(date) === week).length
    return doneThisWeek < timesPerWeek
  })
}

export function reminderBody(due: Habit[]) {
  const names = due.map((habit) => habit?.name).filter(Boolean)
  if (names.length === 0) return ''
  if (names.length === 1) return `${names[0]} is still open today.`
  if (names.length === 2) return `${names[0]} and ${names[1]} are still open today.`
  return `${names.length} habits still open, including ${names[0]} and ${names[1]}.`
}

// Whether this subscription should be pushed to on this tick of the job.
export function shouldSend(row: { reminder_hour: number; last_sent_on?: string | null }, local: { date: string; hour: number }) {
  if (local.hour !== row.reminder_hour) return false
  if (row.last_sent_on === local.date) return false
  return true
}
