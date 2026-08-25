import { useState } from 'react'
import { addMonths, entryYears } from '../calendarGrid.js'
import { todayISO } from '../dates.js'
import JournalMonthView from './JournalMonthView.jsx'
import JournalYearView from './JournalYearView.jsx'

function JournalCalendar({ entries, onSelectDay }) {
  const today = todayISO()
  const todayYear = Number(today.slice(0, 4))
  const todayMonth = Number(today.slice(5, 7)) - 1

  const [mode, setMode] = useState('month')
  const [monthCursorYear, setMonthCursorYear] = useState(todayYear)
  const [monthCursorMonth, setMonthCursorMonth] = useState(todayMonth)
  const [yearCursor, setYearCursor] = useState(todayYear)

  const years = entryYears(entries)
  const canGoPrevYear = years.has(yearCursor - 1)
  const canGoNextYear = years.has(yearCursor + 1)

  function handleMonthNavigate(delta) {
    const next = addMonths(monthCursorYear, monthCursorMonth, delta)
    setMonthCursorYear(next.year)
    setMonthCursorMonth(next.month)
  }

  return (
    <section className="section">
      <div className="section-header">
        <h2 className="label-sm">History</h2>
        <div className="segmented" role="tablist" aria-label="Calendar range">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'month'}
            className={`segmented-option${mode === 'month' ? ' is-active' : ''}`}
            onClick={() => setMode('month')}
          >
            Month
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'year'}
            className={`segmented-option${mode === 'year' ? ' is-active' : ''}`}
            onClick={() => setMode('year')}
          >
            Year
          </button>
        </div>
      </div>

      {mode === 'month' ? (
        <JournalMonthView
          year={monthCursorYear}
          month={monthCursorMonth}
          entries={entries}
          onSelectDay={onSelectDay}
          onNavigate={handleMonthNavigate}
        />
      ) : (
        <JournalYearView
          year={yearCursor}
          entries={entries}
          onSelectDay={onSelectDay}
          canGoPrev={canGoPrevYear}
          canGoNext={canGoNextYear}
          onNavigate={(delta) => setYearCursor(yearCursor + delta)}
        />
      )}
    </section>
  )
}

export default JournalCalendar
