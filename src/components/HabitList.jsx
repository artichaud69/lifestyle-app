import HabitRow from './HabitRow.jsx'
import { formatShortLabel } from '../dates.js'

function HabitList({ habits, dates, today, onToggleDate, onUpdateHabit, onDeleteHabit }) {
  return (
    <div className="habit-grid-wrapper">
      <div className="habit-grid" style={{ gridTemplateColumns: `88px repeat(${dates.length}, 48px)` }}>
        <div />
        {dates.map((date) => (
          <div key={date} className={`date-header${date === today ? ' today' : ''}`}>
            {formatShortLabel(date)}
          </div>
        ))}
        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            name={habit.name}
            dates={dates}
            doneDates={habit.doneDates}
            startDate={habit.startDate}
            timesPerWeek={habit.timesPerWeek}
            onToggleDate={(date) => onToggleDate(habit.id, date)}
            onUpdateHabit={(updates) => onUpdateHabit(habit.id, updates)}
            onDelete={() => onDeleteHabit(habit.id)}
          />
        ))}
      </div>
    </div>
  )
}

export default HabitList
