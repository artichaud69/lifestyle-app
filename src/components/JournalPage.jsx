import { useState, useEffect } from 'react'
import { loadJournal, saveJournal } from '../journal.js'
import JournalYearMap from './JournalYearMap.jsx'
import JournalDayModal from './JournalDayModal.jsx'

function JournalPage() {
  const [entries, setEntries] = useState(() => loadJournal())
  const [selectedDate, setSelectedDate] = useState(null)

  useEffect(() => {
    saveJournal(entries)
  }, [entries])

  function handleSave(date, entry) {
    setEntries({ ...entries, [date]: entry })
  }

  return (
    <>
      <h1>Journal</h1>
      <p className="journal-prompt">Tap any day to log how you felt.</p>
      <JournalYearMap entries={entries} onSelectDay={setSelectedDate} />
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
