import { useState, useEffect } from 'react'
import { loadJournal, saveJournal, MOODS } from '../journal.js'
import { todayISO } from '../dates.js'
import FlameIcon from './FlameIcon.jsx'
import JournalCalendar from './JournalCalendar.jsx'
import JournalDayModal from './JournalDayModal.jsx'
import PageHeader from './PageHeader.jsx'
import { PAGE_ICONS } from '../navIcons.js'

function JournalPage() {
  const [entries, setEntries] = useState(() => loadJournal())
  const [selectedDate, setSelectedDate] = useState(null)
  const today = todayISO()
  const todayEntry = entries[today]

  useEffect(() => {
    saveJournal(entries)
  }, [entries])

  function handleSave(date, entry) {
    setEntries({ ...entries, [date]: entry })
  }

  function handleQuickPick(mood) {
    setEntries({ ...entries, [today]: { mood, note: '' } })
  }

  return (
    <>
      <PageHeader title="Journal" icon={PAGE_ICONS.journal} />

      {todayEntry ? (
        <button type="button" className="today-done-card" onClick={() => setSelectedDate(today)}>
          <FlameIcon level={todayEntry.mood} size={32} />
          <div>
            <div className="today-done-title">Today logged</div>
            <div className="today-done-label">Tap to edit</div>
          </div>
        </button>
      ) : (
        <>
          <p className="journal-prompt">How do you feel today?</p>
          <div className="mood-picker">
            {MOODS.map((moodOption) => (
              <button
                key={moodOption.value}
                type="button"
                className="mood-option"
                onClick={() => handleQuickPick(moodOption.value)}
                aria-label={moodOption.label}
              >
                <FlameIcon level={moodOption.value} />
              </button>
            ))}
          </div>
        </>
      )}

      <JournalCalendar entries={entries} onSelectDay={setSelectedDate} />

      {selectedDate && (
        <JournalDayModal
          date={selectedDate}
          entry={entries[selectedDate]}
          onSave={handleSave}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </>
  )
}

export default JournalPage
