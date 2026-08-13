import { buildMonthGrid, weekdayLabels } from '../calendarGrid.js'
import { WEEK_STARTS_ON } from '../frequency.js'
import { todayISO } from '../dates.js'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function JournalCalendar({ entries, onSelectDay }) {
  const today = todayISO()
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const weeks = buildMonthGrid(year, month, WEEK_STARTS_ON)
  const labels = weekdayLabels(WEEK_STARTS_ON)

  return (
    <div className="calendar">
      <div className="calendar-month-label">
        {MONTH_NAMES[month]} {year}
      </div>
      <div className="calendar-weekdays">
        {labels.map((label, index) => (
          <div key={index} className="calendar-weekday">
            {label}
          </div>
        ))}
      </div>
      <div className="calendar-grid">
        {weeks.flatMap((week, weekIndex) =>
          week.map((cell, dayIndex) => {
            if (!cell) {
              return <div key={`${weekIndex}-${dayIndex}`} className="calendar-day empty" />
            }
            const entry = entries[cell.date]
            const moodClass = entry ? ` mood-${entry.mood}` : ''
            const isToday = cell.date === today
            const isFuture = cell.date > today
            return (
              <button
                key={cell.date}
                type="button"
                className={`calendar-day${moodClass}${isToday ? ' today' : ''}${isFuture ? ' future' : ''}`}
                onClick={() => onSelectDay(cell.date)}
                disabled={isFuture}
                aria-label={cell.date}
                title={cell.date}
              >
                {cell.day}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

export default JournalCalendar
