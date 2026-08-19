import HabitList from './HabitList.jsx'
import AddHabitForm from './AddHabitForm.jsx'
import PageHero from './PageHero.jsx'
import { PAGE_ICONS } from '../navIcons.js'

function HabitsPage({ habits, onAddHabit, onToggleDate, onUpdateHabit, onDeleteHabit, onBack }) {
  return (
    <div className="page">
      <PageHero view="habits" title="Habit Tracker" onBack={onBack}>
        <AddHabitForm onAdd={onAddHabit} />
      </PageHero>

      <div className="page-body">
      <HabitList
        habits={habits}
        onToggleDate={onToggleDate}
        onUpdateHabit={onUpdateHabit}
        onDeleteHabit={onDeleteHabit}
      />
      </div>
    </div>
  )
}

export default HabitsPage
