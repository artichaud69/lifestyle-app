import { useState } from 'react'
import HabitRow from './components/HabitRow.jsx'
import AddHabitForm from './components/AddHabitForm.jsx'

const initialHabits = [
  { id: crypto.randomUUID(), name: 'Meditate', days: [true, false, true, true, false, true, true] },
  { id: crypto.randomUUID(), name: 'Read', days: [true, true, false, false, true, false, true] },
  { id: crypto.randomUUID(), name: 'No sugar', days: [false, true, true, false, false, true, false] },
]

function App() {
  const [habits, setHabits] = useState(initialHabits)

  function addHabit(name) {
    const newHabit = {
      id: crypto.randomUUID(),
      name,
      days: [false, false, false, false, false, false, false],
    }
    setHabits([...habits, newHabit])
  }

  return (
    <div>
      <h1>Habit Tracker</h1>
      {habits.map((habit) => (
        <HabitRow key={habit.id} name={habit.name} days={habit.days} />
      ))}
      <AddHabitForm onAdd={addHabit} />
    </div>
  )
}

export default App
