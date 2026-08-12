import HabitRow from './components/HabitRow.jsx'

const habits = [
  { name: 'Meditate', days: [true, false, true, true, false, true, true] },
  { name: 'Read', days: [true, true, false, false, true, false, true] },
  { name: 'No sugar', days: [false, true, true, false, false, true, false] },
]

function App() {
  return (
    <div>
      <h1>Habit Tracker</h1>
      {habits.map((habit) => (
        <HabitRow key={habit.name} name={habit.name} days={habit.days} />
      ))}
    </div>
  )
}

export default App
