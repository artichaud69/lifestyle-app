import { useState, useEffect } from 'react'
import HabitsPage from './components/HabitsPage.jsx'
import GoalsPage from './components/GoalsPage.jsx'
import SummaryPage from './components/SummaryPage.jsx'
import JournalPage from './components/JournalPage.jsx'
import NavBar from './components/NavBar.jsx'
import { loadHabits, saveHabits } from './storage.js'
import { defaultHabits } from './defaultHabits.js'

function App() {
  const [habits, setHabits] = useState(() => loadHabits() ?? defaultHabits)
  const [view, setView] = useState('summary')

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  function addHabit(name, startDate, timesPerWeek) {
    const newHabit = {
      id: crypto.randomUUID(),
      name,
      startDate,
      timesPerWeek,
      doneDates: [],
    }
    setHabits([...habits, newHabit])
  }

  function addHabits(newHabits) {
    setHabits([...habits, ...newHabits])
  }

  function toggleDate(habitId, dateISO) {
    setHabits(
      habits.map((habit) => {
        if (habit.id !== habitId) return habit
        const isDone = habit.doneDates.includes(dateISO)
        const newDoneDates = isDone
          ? habit.doneDates.filter((date) => date !== dateISO)
          : [...habit.doneDates, dateISO]
        return { ...habit, doneDates: newDoneDates }
      }),
    )
  }

  function updateHabit(habitId, updates) {
    setHabits(habits.map((habit) => (habit.id === habitId ? { ...habit, ...updates } : habit)))
  }

  function deleteHabit(habitId) {
    setHabits(habits.filter((habit) => habit.id !== habitId))
  }

  return (
    <div className="app">
      {view === 'habits' && (
        <HabitsPage
          habits={habits}
          onAddHabit={addHabit}
          onToggleDate={toggleDate}
          onUpdateHabit={updateHabit}
          onDeleteHabit={deleteHabit}
        />
      )}
      {view === 'goals' && <GoalsPage habits={habits} onAddHabits={addHabits} />}
      {view === 'summary' && <SummaryPage habits={habits} onChangeView={setView} />}
      {view === 'journal' && <JournalPage />}
      <NavBar view={view} onChangeView={setView} />
    </div>
  )
}

export default App
