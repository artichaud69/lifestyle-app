import { ChevronLeft, ChevronRight } from 'lucide-react'
import { buildMonthGrid, weekdayLabels, MONTH_NAMES } from '../calendarGrid.js'
import { WEEK_STARTS_ON } from '../frequency.js'
import { todayISO } from '../dates.js'

// Days sit on whitespace rather than in thirty-one bordered boxes. State is
// carried by fill (an entry, tinted by mood), an outline (today) and dimming
// (unavailable) - never by colour alone, since each also changes shape.
function JournalMonthView({ year, month, entries, onSelectDay, onNavigate }) {
  const today = todayISO()
  const weeks = buildMonthGrid(year, month, WEEK_STARTS_ON)
  const labels = weekdayLabels(WEEK_STARTS_ON)

  return (
    <>
      <div className="cal-nav">
        <button type="button" className="btn-icon" onClick={() => onNavigate(-1)} aria-label="Previous month">
          <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <div className="cal-month">
          {MONTH_NAMES[month]} {year}
        </div>
        <button type="button" className="btn-icon" onClick={() => onNavigate(1)} aria-label="Next month">
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div>
        <div className="cal-weekdays">
          {labels.map((label, index) => (
            <div key={index} className="cal-weekday">
              {label}
            </div>
          ))}
        </div>
        <div className="cal-grid">
          {weeks.flatMap((week, weekIndex) =>
            week.map((cell, dayIndex) => {
              if (!cell) {
                return <div key={`${weekIndex}-${dayIndex}`} className="cal-day is-empty" />
              }
              const entry = entries[cell.date]
              const isToday = cell.date === today
              const isFuture = cell.date > today
              const classes = [
                'cal-day',
                entry ? `has-entry mood-${entry.mood}` : '',
                isToday ? 'is-today' : '',
                isFuture ? 'is-future' : '',
              ]
                .filter(Boolean)
                .join(' ')

              return (
                <button
                  key={cell.date}
                  type="button"
                  className={classes}
                  onClick={() => onSelectDay(cell.date)}
                  disabled={isFuture}
                  aria-label={`${cell.date}${entry ? ', logged' : ''}${isToday ? ', today' : ''}`}
                >
                  {cell.day}
                </button>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

export default JournalMonthView
