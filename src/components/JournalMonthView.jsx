import { buildMonthGrid, weekdayLabels, MONTH_NAMES } from '../calendarGrid.js'
import { WEEK_STARTS_ON } from '../frequency.js'
import { todayISO } from '../dates.js'

function JournalMonthView({ year, month, entries, onSelectDay, onNavigate }) {
  const today = todayISO()
  const weeks = buildMonthGrid(year, month, WEEK_STARTS_ON)
  const labels = weekdayLabels(WEEK_STARTS_ON)

  return (
    <>
      <div className="calendar-nav">
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => onNavigate(-1)}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="calendar-month-label">
          {MONTH_NAMES[month]} {year}
        </div>
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => onNavigate(1)}
          aria-label="Next month"
        >
          ›
        </button>
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
    </>
  )
}

export default JournalMonthView
