import HabitList from './HabitList.jsx'
import AddHabitForm from './AddHabitForm.jsx'
import PageHeader from './PageHeader.jsx'

function HabitsPage({ habits, onAddHabit, onToggleDate, onUpdateHabit, onDeleteHabit }) {
  return (
    <>
      <PageHeader title="Habit Tracker">
        <AddHabitForm onAdd={onAddHabit} />
      </PageHeader>
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
