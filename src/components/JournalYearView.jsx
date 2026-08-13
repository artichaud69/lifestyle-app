import { buildMonthGrid, MONTH_NAMES_SHORT } from '../calendarGrid.js'
import { WEEK_STARTS_ON } from '../frequency.js'
import { todayISO } from '../dates.js'

function JournalYearView({ year, entries, onSelectDay, canGoPrev, canGoNext, onNavigate }) {
  const today = todayISO()

  return (
    <>
      <div className="calendar-nav">
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => onNavigate(-1)}
          disabled={!canGoPrev}
          aria-label="Previous year"
        >
          ‹
        </button>
        <div className="calendar-month-label">{year}</div>
        <button
          type="button"
          className="calendar-nav-button"
          onClick={() => onNavigate(1)}
          disabled={!canGoNext}
          aria-label="Next year"
        >
          ›
        </button>
      </div>
      <div className="year-view">
        {MONTH_NAMES_SHORT.map((label, month) => {
          const weeks = buildMonthGrid(year, month, WEEK_STARTS_ON)
          return (
            <div key={month} className="year-month">
              <div className="year-month-label">{label}</div>
              <div className="year-month-grid">
                {weeks.flatMap((week, weekIndex) =>
                  week.map((cell, dayIndex) => {
                    if (!cell) {
                      return <div key={`${weekIndex}-${dayIndex}`} className="year-month-day empty" />
                    }
                    const entry = entries[cell.date]
                    const moodClass = entry ? ` mood-${entry.mood}` : ''
                    const isToday = cell.date === today
                    const isFuture = cell.date > today
                    return (
                      <button
                        key={cell.date}
                        type="button"
                        className={`year-month-day${moodClass}${isToday ? ' today' : ''}${isFuture ? ' future' : ''}`}
                        onClick={() => onSelectDay(cell.date)}
                        disabled={isFuture}
                        aria-label={cell.date}
                        title={cell.date}
                      />
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}

export default JournalYearView
