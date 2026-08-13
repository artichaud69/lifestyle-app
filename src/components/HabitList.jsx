import HabitRow from './HabitRow.jsx'

function HabitList({ habits, onToggleDate, onUpdateHabit, onDeleteHabit }) {
  return (
    <div className="habit-list">
      {habits.map((habit) => (
        <HabitRow
          key={habit.id}
          name={habit.name}
          doneDates={habit.doneDates}
          startDate={habit.startDate}
          timesPerWeek={habit.timesPerWeek}
          onToggleDate={(date) => onToggleDate(habit.id, date)}
          onUpdateHabit={(updates) => onUpdateHabit(habit.id, updates)}
          onDelete={() => onDeleteHabit(habit.id)}
        />
      ))}
    </div>
  )
}

export default HabitList
