import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { addDays, todayISO, formatShortLabel } from '../dates.js'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Seven days with explicit navigation, replacing a native horizontal
// scrollbar that ran the habit's entire history. A scrollbar made the app
// look unfinished and gave no sense of which week you were looking at.
function HabitWeek({ weekStart, doneDates, startDate, onToggleDate, onNavigate, canGoNext }) {
  const today = todayISO()
  const days = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index))
  const weekEnd = days[6]

  return (
    <>
      <div className="habit-week-nav">
        <button
          type="button"
          className="btn-icon"
          onClick={() => onNavigate(-1)}
          aria-label="Previous week"
        >
          <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
        <span className="habit-week-range">
          {formatShortLabel(weekStart)} — {formatShortLabel(weekEnd)}
        </span>
        <button
          type="button"
          className="btn-icon"
          onClick={() => onNavigate(1)}
          disabled={!canGoNext}
          aria-label="Next week"
        >
          <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className="habit-week">
        {days.map((date, index) => {
          const done = doneDates.includes(date)
          const isToday = date === today
          // Nothing to record before the habit existed, or in the future.
          const unavailable = date > today || date < startDate
          const classes = [
            'habit-day',
            done ? 'is-done' : '',
            isToday ? 'is-today' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={date}
              type="button"
              role="checkbox"
              aria-checked={done}
              aria-label={`${formatShortLabel(date)}${done ? ', done' : ''}`}
              className={classes}
              disabled={unavailable}
              onClick={() => onToggleDate(date)}
            >
              <span className="habit-day-weekday">{WEEKDAYS[index]}</span>
              <span className="habit-day-dot">
                {done && <Check size={13} strokeWidth={3} aria-hidden="true" />}
              </span>
              <span className="habit-day-number">{Number(date.slice(8, 10))}</span>
            </button>
          )
        })}
      </div>
    </>
  )
}

export default HabitWeek
