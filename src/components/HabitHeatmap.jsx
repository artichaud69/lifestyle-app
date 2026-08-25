import { addDays, todayISO, startOfWeek } from '../dates.js'
import { WEEK_STARTS_ON } from '../frequency.js'

const WEEKS = 4

// Four weeks of history as a fixed contribution grid. The old version drew
// one square per day since the habit began, so its width - and its meaning -
// changed with every habit.
function HabitHeatmap({ doneDates, startDate }) {
  const today = todayISO()
  const doneSet = new Set(doneDates)
  const firstWeek = startOfWeek(addDays(today, -7 * (WEEKS - 1)), WEEK_STARTS_ON)

  const cells = []
  for (let index = 0; index < WEEKS * 7; index++) {
    const date = addDays(firstWeek, index)
    // Days outside the habit's life are held open so the grid keeps its shape.
    const outside = date > today || date < startDate
    cells.push({ date, done: doneSet.has(date), outside })
  }

  return (
    <div className="heatmap" aria-hidden="true">
      {cells.map((cell) => (
        <div
          key={cell.date}
          title={cell.outside ? undefined : `${cell.date}: ${cell.done ? 'done' : 'not done'}`}
          className={`heatmap-cell${cell.outside ? ' is-outside' : cell.done ? ' is-done' : ''}`}
        />
      ))}
    </div>
  )
}

export default HabitHeatmap
