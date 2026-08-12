import { useState, useEffect } from 'react'
import HabitRow from './components/HabitRow.jsx'
import AddHabitForm from './components/AddHabitForm.jsx'
import { loadHabits, saveHabits } from './storage.js'

const defaultHabits = [
  { id: crypto.randomUUID(), name: 'Meditate', days: [true, false, true, true, false, true, true] },
  { id: crypto.randomUUID(), name: 'Read', days: [true, true, false, false, true, false, true] },
  { id: crypto.randomUUID(), name: 'No sugar', days: [false, true, true, false, false, true, false] },
]

function App() {
  const [habits, setHabits] = useState(() => loadHabits() ?? defaultHabits)

  useEffect(() => {
    saveHabits(habits)
  }, [habits])

  function addHabit(name) {
    const newHabit = {
      id: crypto.randomUUID(),
      name,
      days: [false, false, false, false, false, false, false],
    }
    setHabits([...habits, newHabit])
  }

  function toggleDay(habitId, dayIndex) {
    setHabits(
      habits.map((habit) => {
        if (habit.id !== habitId) return habit
        const newDays = [...habit.days]
        newDays[dayIndex] = !newDays[dayIndex]
        return { ...habit, days: newDays }
      }),
    )
  }

  return (
    <div>
      <h1>Habit Tracker</h1>
      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          name={habit.name}
          days={habit.days}
          onToggleDay={(dayIndex) => toggleDay(habit.id, dayIndex)}
        />
      ))}
      <AddHabitForm onAdd={addHabit} />
    </div>
  )
}

export default App
