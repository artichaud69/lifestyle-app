import HabitList from './HabitList.jsx'
import AddHabitForm from './AddHabitForm.jsx'

function HabitsPage({ habits, onAddHabit, onToggleDate, onUpdateHabit, onDeleteHabit }) {
  return (
    <>
      <header className="app-header">
        <h1>Habit Tracker</h1>
        <AddHabitForm onAdd={onAddHabit} />
      </header>
      <HabitList
        habits={habits}
        onToggleDate={onToggleDate}
        onUpdateHabit={onUpdateHabit}
        onDeleteHabit={onDeleteHabit}
      />
    </>
  )
}

export default HabitsPage
