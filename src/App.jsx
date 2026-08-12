import { useState, useEffect } from 'react'
import HabitRow from './components/HabitRow.jsx'
import AddHabitForm from './components/AddHabitForm.jsx'
import { loadHabits, saveHabits } from './storage.js'
import { todayISO, lastNDates, formatShortLabel } from './dates.js'

const WINDOW_SIZE = 5
const demoDates = lastNDates(WINDOW_SIZE)
// a longer history for one demo habit, so the heatmap has more than 5 squares to show
const meditateHistory = lastNDates(12)

const defaultHabits = [
  {
    id: crypto.randomUUID(),
    name: 'Meditate',
    createdAt: meditateHistory[0],
    doneDates: [
      meditateHistory[0],
      meditateHistory[3],
      meditateHistory[5],
      meditateHistory[7],
      meditateHistory[9],
      meditateHistory[10],
      meditateHistory[11],
    ],
  },
  {
    id: crypto.randomUUID(),
    name: 'Read',
    createdAt: demoDates[0],
    doneDates: [demoDates[0], demoDates[1], demoDates[3]],
  },
  {
    id: crypto.randomUUID(),
    name: 'No sugar',
    createdAt: demoDates[0],
    doneDates: [demoDates[1], demoDates[2]],
  },
]

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

  const today = todayISO()

  return (
    <div style={{ padding: '12px', maxWidth: '100%', boxSizing: 'border-box' }}>
      <h1>Habit Tracker</h1>
      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `88px repeat(${WINDOW_SIZE}, 48px)`,
            rowGap: '8px',
            alignItems: 'center',
          }}
        >
          <div />
          {dates.map((date) => (
            <div
              key={date}
              style={{
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: date === today ? 'bold' : 'normal',
                color: date === today ? '#0a58ca' : 'inherit',
              }}
            >
              {formatShortLabel(date)}
            </div>
          ))}
          {habits.map((habit) => (
            <HabitRow
              key={habit.id}
              name={habit.name}
              dates={dates}
              doneDates={habit.doneDates}
              createdAt={habit.createdAt}
              onToggleDate={(date) => toggleDate(habit.id, date)}
            />
          ))}
        </div>
      </div>
      <AddHabitForm onAdd={addHabit} />
    </div>
  )
}

export default App
