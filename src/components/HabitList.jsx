import HabitRow from './HabitRow.jsx'
import { formatShortLabel } from '../dates.js'

function HabitList({ habits, dates, today, onToggleDate, onUpdateHabit, onDeleteHabit }) {
  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `88px repeat(${dates.length}, 48px)`,
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
            startDate={habit.startDate}
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
