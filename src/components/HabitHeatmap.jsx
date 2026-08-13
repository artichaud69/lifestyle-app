import { datesBetween, todayISO, formatShortLabel } from '../dates.js'
import { weeksList, weeklyCompletionPercent } from '../frequency.js'
import { currentStreak, bestStreak } from '../streaks.js'

function HabitHeatmap({ startDate, doneDates, timesPerWeek }) {
  const allDates = datesBetween(startDate, todayISO())
  const doneSet = new Set(doneDates)
  const weeks = weeksList(startDate)
  const percent = weeklyCompletionPercent(startDate, doneDates, timesPerWeek)
  const streak = currentStreak(startDate, doneDates, timesPerWeek)
  const best = bestStreak(startDate, doneDates, timesPerWeek)

  return (
    <div className="habit-heatmap">
      <div className="habit-streak">
        {streak > 0 ? `🔥 ${streak}-week streak` : 'No active streak'}
        {' · '}Best {best}
      </div>
      <div className="habit-heatmap-summary">
        {percent}% · Target {timesPerWeek}x/week · since {formatShortLabel(startDate)} ({weeks.length} week
        {weeks.length === 1 ? '' : 's'})
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
