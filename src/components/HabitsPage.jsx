import HabitList from './HabitList.jsx'
import AddHabitForm from './AddHabitForm.jsx'
import PageHeader from './PageHeader.jsx'
import { PAGE_ICONS } from '../navIcons.js'

function HabitsPage({ habits, onAddHabit, onToggleDate, onUpdateHabit, onDeleteHabit }) {
  return (
    <>
      <PageHeader title="Habit Tracker" icon={PAGE_ICONS.habits}>
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
