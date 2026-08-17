export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export function nowISO() {
  return new Date().toISOString()
}

export function formatDate(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(iso) {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function formatDuration(minutes) {
  if (!minutes && minutes !== 0) return ''
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  if (h === 0) return `${m}m`
  return `${h}h ${m}m`
}

export function daysAgo(iso) {
  const then = new Date(iso).getTime()
  const now = Date.now()
  return Math.floor((now - then) / (1000 * 60 * 60 * 24))
}
