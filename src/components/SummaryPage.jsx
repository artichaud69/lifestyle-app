import { todayISO } from '../dates.js'
import { currentStreak, bestStreak } from '../streaks.js'
import { weeklyCompletionPercent } from '../frequency.js'

function SummaryPage({ habits }) {
  const today = todayISO()
  const doneToday = habits.filter((habit) => habit.doneDates.includes(today)).length

  return (
    <>
      <h1>Summary</h1>
      <div className="summary-today-card">
        <div className="summary-today-value">
          {doneToday} / {habits.length}
        </div>
        <div className="summary-today-label">habits done today</div>
      </div>

      {habits.length === 0 ? (
        <p className="summary-empty">No habits yet.</p>
      ) : (
        <div className="summary-list">
          {habits.map((habit) => {
            const streak = currentStreak(habit.startDate, habit.doneDates, habit.timesPerWeek)
            const best = bestStreak(habit.startDate, habit.doneDates, habit.timesPerWeek)
            const percent = weeklyCompletionPercent(habit.startDate, habit.doneDates, habit.timesPerWeek)
            return (
              <div key={habit.id} className="summary-row">
                <div className="summary-row-name">{habit.name}</div>
                <div className="summary-row-stats">
                  {streak > 0 ? `🔥 ${streak}-week streak` : 'No active streak'} · Best {best} · {percent}%
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}

export default SummaryPage
