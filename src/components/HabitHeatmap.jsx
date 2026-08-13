import { datesBetween, todayISO, formatShortLabel } from '../dates.js'

function HabitHeatmap({ startDate, doneDates }) {
  const allDates = datesBetween(startDate, todayISO())
  const doneSet = new Set(doneDates)
  const totalCount = allDates.length
  const doneCount = allDates.filter((date) => doneSet.has(date)).length
  const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  return (
    <div className="habit-heatmap">
      <div className="habit-heatmap-summary">
        {percent}% since {formatShortLabel(startDate)} ({totalCount} day{totalCount === 1 ? '' : 's'})
      </div>
      <div className="heatmap-squares">
        {allDates.map((date) => (
          <div
            key={date}
            title={`${date}: ${doneSet.has(date) ? 'done' : 'not done'}`}
            className={`heatmap-square${doneSet.has(date) ? ' done' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default HabitHeatmap
