import { useState, useEffect } from 'react'
import HabitList from './components/HabitList.jsx'
import AddHabitForm from './components/AddHabitForm.jsx'
import { loadHabits, saveHabits } from './storage.js'
import { todayISO, lastNDates } from './dates.js'
import { defaultHabits } from './defaultHabits.js'

const WINDOW_SIZE = 5

function App() {
  const [habits, setHabits] = useState(() => loadHabits() ?? defaultHabits)
  const dates = lastNDates(WINDOW_SIZE)

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  function addHabit(name) {
    const newHabit = {
      id: crypto.randomUUID(),
      name,
      createdAt: todayISO(),
      doneDates: [],
    }
    setHabits([...habits, newHabit])
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

  return (
    <div style={{ padding: '12px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h1>Habit Tracker</h1>
      <HabitList habits={habits} dates={dates} today={todayISO()} onToggleDate={toggleDate} />
      <AddHabitForm onAdd={addHabit} />
    </div>
  )
}

export default App
