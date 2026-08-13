import { useState, useEffect } from 'react'
import { loadJournal, saveJournal, MOODS } from '../journal.js'
import { todayISO, formatShortLabel } from '../dates.js'

function JournalPage() {
  const [entries, setEntries] = useState(() => loadJournal())
  const today = todayISO()

  useEffect(() => {
    saveJournal(entries)
  }, [entries])

  function selectMood(value) {
    setEntries({ ...entries, [today]: value })
  }

  const history = Object.entries(entries)
    .filter(([date]) => date !== today)
    .sort(([a], [b]) => (a < b ? 1 : -1))

  return (
    <>
      <h1>Journal</h1>
      <div className="journal-prompt">How do you feel today?</div>
      <div className="mood-picker">
        {MOODS.map((mood) => (
          <button
            key={mood.value}
            type="button"
            className={`mood-option${entries[today] === mood.value ? ' active' : ''}`}
            onClick={() => selectMood(mood.value)}
            aria-label={mood.label}
          >
            {mood.emoji}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className="journal-history">
          <div className="journal-history-title">History</div>
          {history.map(([date, value]) => {
            const mood = MOODS.find((m) => m.value === value)
            return (
              <div key={date} className="journal-entry">
                <span>{formatShortLabel(date)}</span>
                <span>{mood?.emoji}</span>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default JournalPage
