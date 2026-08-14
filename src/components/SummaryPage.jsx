import { todayISO, datesBetween } from '../dates.js'
import { currentStreak, bestStreak } from '../streaks.js'
import { weeklyCompletionPercent } from '../frequency.js'
import PageHeader from './PageHeader.jsx'
import SyncPanel from './SyncPanel.jsx'
import DailyQuote from './DailyQuote.jsx'
import { PAGE_ICONS } from '../navIcons.js'

const QUICK_LINKS = [
  { key: 'habits', label: 'Habits', icon: PAGE_ICONS.habits },
  { key: 'goals', label: 'Goals', icon: PAGE_ICONS.goals },
  { key: 'journal', label: 'Journal', icon: PAGE_ICONS.journal },
]

function SummaryPage({ habits, onChangeView, sync }) {
  const today = todayISO()
  const doneToday = habits.filter((habit) => habit.doneDates.includes(today)).length
  const year = Number(today.slice(0, 4))
  const daysLeftInYear = datesBetween(today, `${year}-12-31`).length - 1
  const totalDaysInYear = datesBetween(`${year}-01-01`, `${year}-12-31`).length
  const yearPercent = Math.round(((totalDaysInYear - daysLeftInYear) / totalDaysInYear) * 100)

  return (
    <div className="wallpaper-page">
      <PageHeader title="Summary" icon={PAGE_ICONS.summary} />

      <div className="summary-links">
        {QUICK_LINKS.map((link) => (
          <button
            key={link.key}
            type="button"
            className="summary-link"
            onClick={() => onChangeView(link.key)}
          >
            <img src={`${import.meta.env.BASE_URL}${link.icon}`} alt="" className="summary-link-icon" />
            {link.label}
          </button>
        ))}
      </div>

      <DailyQuote />

      <div className="summary-today-card">
        <div className="summary-today-value">
          {doneToday} / {habits.length}
        </div>
        <div className="summary-today-label">habits done today</div>
      </div>
      <div className="summary-today-card">
        <div className="summary-today-value">{daysLeftInYear}</div>
        <div className="summary-today-label">days left in {year}</div>
        <div className="year-progress-track">
          <div className="year-progress-fill" style={{ width: `${yearPercent}%` }} />
        </div>
        <div className="year-progress-label">{yearPercent}% of the year gone</div>
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

      <h2 className="section-heading">Backup</h2>
      <SyncPanel
        session={sync.session}
        ready={sync.ready}
        status={sync.status}
        message={sync.message}
        syncedAt={sync.syncedAt}
        onSignIn={sync.signIn}
        onSignUp={sync.signUp}
        onSetPassword={sync.setPassword}
        onSignOut={sync.signOut}
      />
    </div>
  )
}

export default SummaryPage
