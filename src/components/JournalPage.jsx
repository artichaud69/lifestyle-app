import { useState, useEffect } from 'react'
import { loadJournal, saveJournal } from '../journal.js'
import { todayISO } from '../dates.js'
import MoodSelector from './MoodSelector.jsx'
import JournalCalendar from './JournalCalendar.jsx'
import JournalDayModal from './JournalDayModal.jsx'
import PageHero from './PageHero.jsx'
import Section from './ui/Section.jsx'
import Button from './ui/Button.jsx'

function JournalPage({ onBack }) {
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
    setEntries({ ...entries, [today]: { mood, note: todayEntry?.note ?? '' } })
  }

  return (
    <div className="page">
      <PageHero view="journal" title="Journal" onBack={onBack} />

      <div className="page-body">
        <Section
          title="How do you feel today?"
          action={
            todayEntry && (
              <Button variant="ghost" onClick={() => setSelectedDate(today)}>
                Add a note
              </Button>
            )
          }
        >
          <MoodSelector value={todayEntry?.mood ?? null} onSelect={handleQuickPick} />
        </Section>

        <JournalCalendar entries={entries} onSelectDay={setSelectedDate} />

        {selectedDate && (
          <JournalDayModal
            date={selectedDate}
            entry={entries[selectedDate]}
            onSave={handleSave}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  )
}

export default JournalPage
